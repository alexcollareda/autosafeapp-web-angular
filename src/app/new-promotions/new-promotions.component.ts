import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, of, firstValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { ImageService } from '../services/image.service';
import { environment } from '../../environments/environment';

type UiActionType = 'PROFILE_REDIRECT' | 'EXTERNAL_LINK' | 'SERVICE_LINK';
type CtaButtonTypeEnum = 'SEE_MORE' | 'BOOK_NOW' | 'CONTACT_US';

interface ServiceOption { id: number; title: string; }

export interface IAlert {
  id: number;
  type: 'success' | 'danger' | 'warning' | 'info';
  strong?: string;
  message: string;
  icon?: string;
}

/** Converte 'YYYY-MM-DD' em Date local 00:00 */
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
/** Regra: fim >= início; duração <= 30d; start >= hoje; end > hoje */
function dateRangeValidator(ctrl: AbstractControl): ValidationErrors | null {
  const start = ctrl.get('startDate')?.value as string | undefined;
  const end   = ctrl.get('endDate')?.value as string | undefined;
  if (!start || !end) return null;

  const s = parseLocalDate(start);
  const e = parseLocalDate(end);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const errors: any = {};

  if (e < s) errors.endBeforeStart = true;
  const oneDay = 24 * 3600 * 1000;
  const diffDays = Math.floor((e.getTime() - s.getTime()) / oneDay) + 1;
  if (diffDays > 30) errors.rangeMax30 = true;

  if (s < today) errors.startInPast = true;
  if (e <= today) errors.endNotFuture = true;

  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-new-promotions',
  templateUrl: './new-promotions.component.html',
  styleUrls: ['./new-promotions.component.scss']
})
export class NewPromotionsComponent implements OnInit, OnDestroy {

  alerts: Array<IAlert> = [];
  saving = false;

  isEdit = false;
  promotionId: number | null = null;

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    ctaButtonType: ['SEE_MORE' as CtaButtonTypeEnum, [Validators.required]],
    type: ['PROFILE_REDIRECT' as UiActionType, Validators.required],
    externalLink: [''],
    serviceId: [null as number | null],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    imageFile: [null as File | null, Validators.required], // em edição removo o required
  }, { validators: [dateRangeValidator] });

  previewUrl: string | null = null;
  selectedFile: File | null = null;
  existingImageUrl: string | null = null;

  // ---- serviços do usuário (para SERVICE_LINK) ----
  allMyServices: ServiceOption[] = [];
  serviceOptions: ServiceOption[] = [];
  serviceQuery = '';
  private serviceSearch$ = new Subject<string>();

  private destroy$ = new Subject<void>();
  private API_ROOT = environment.backendApiUrl;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private imageService: ImageService
  ) {}

  // ====== AUTH HELPERS (sem interceptor) ======
  private getToken(): string | null {
    return (
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      null
    );
  }
  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    let h = new HttpHeaders();
    if (token) h = h.set('Authorization', `Bearer ${token}`);
    return h;
  }
  // ============================================

  ngOnInit(): void {
    // modo edição?
    const idStr = this.route.snapshot.queryParamMap.get('promotionId');
    this.isEdit = !!idStr;
    this.promotionId = idStr ? Number(idStr) : null;

    // validações condicionais
    this.form.get('type')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((type: UiActionType) => {
        const link = this.form.get('externalLink')!;
        const svc  = this.form.get('serviceId')!;
        link.clearValidators();
        svc.clearValidators();

        if (type === 'EXTERNAL_LINK') {
          link.setValidators([Validators.required, Validators.maxLength(500), Validators.pattern(/^https?:\/\/.+/i)]);
        } else if (type === 'SERVICE_LINK') {
          svc.setValidators([Validators.required]);
          // quando muda para SERVICE_LINK, popular lista inicial
          this.computeServiceOptions(this.serviceQuery);
        }
        link.updateValueAndValidity();
        svc.updateValueAndValidity();
      });

    // busca incremental no input de serviço
    this.serviceSearch$
      .pipe(takeUntil(this.destroy$), debounceTime(250), distinctUntilChanged())
      .subscribe(q => this.computeServiceOptions(q));

    // carrega serviços do usuário (precisa de JWT — agora vai no header por requisição)
    this.loadMyServices();

    // edição carrega promoção
    if (this.isEdit && this.promotionId) {
      this.loadPromotion(this.promotionId);
      // imagem não obrigatória em edição
      this.form.get('imageFile')!.clearValidators();
      this.form.get('imageFile')!.updateValueAndValidity();
    }
  }

  /** Tenta /public/services com JWT; se 403 e você tiver companyId salvo, tenta /public/services/{companyId} */
  private async loadMyServices(): Promise<void> {
    try {
      const list: any[] = await firstValueFrom(
        this.http.get<any[]>(`${this.API_ROOT}/public/services`, { headers: this.authHeaders() })
      );
      this.allMyServices = (list || []).map(this.mapService);
    } catch (e: any) {
      // fallback opcional (sem header)
      const cid = localStorage.getItem('companyId');
      if (cid) {
        try {
          const list2: any[] = await firstValueFrom(
            this.http.get<any[]>(`${this.API_ROOT}/public/services/${cid}`)
          );
          this.allMyServices = (list2 || []).map(this.mapService);
        } catch {
          this.allMyServices = [];
        }
      } else {
        this.allMyServices = [];
      }
    } finally {
      if (this.form.get('type')!.value === 'SERVICE_LINK') {
        this.computeServiceOptions(this.serviceQuery);
      }
    }
  }

  private mapService = (s: any): ServiceOption => ({
    id:  s.id ?? s.serviceId ?? s.idService,
    title: s.title ?? s.name ?? s.serviceName ?? s.descricao ?? 'Serviço'
  });

  /** Filtra localmente os serviços por título */
  private computeServiceOptions(query: string): void {
    const q = (query || '').trim().toLowerCase();
    const base = this.allMyServices || [];
    const filtered = q
      ? base.filter(s => (s.title || '').toLowerCase().includes(q))
      : base.slice(0, 100);
    this.serviceOptions = filtered.slice(0, 40);
  }

  /** Carrega a promoção (edição) */
  private loadPromotion(id: number) {
    this.http.get<any>(`${this.API_ROOT}/api/promotions/company/${id}`, { headers: this.authHeaders() }).subscribe({
      next: (p) => {
        this.form.patchValue({
          title: p.title ?? '',
          description: p.description ?? '',
          ctaButtonType: p.ctaButtonType ?? 'SEE_MORE',
          type: p.promotionType ?? 'PROFILE_REDIRECT',
          externalLink: p.targetUrl ?? '',
          serviceId: p.serviceId ?? null,
          startDate: p.startDate ?? '',
          endDate: p.endDate ?? ''
        });

        if (p.serviceId && p.serviceName) {
          this.serviceQuery = p.serviceName;
        }
        this.existingImageUrl = p.imageUrl ?? null;
        this.previewUrl = null;

        if (this.form.get('type')!.value === 'SERVICE_LINK') {
          this.computeServiceOptions(this.serviceQuery);
        }
      },
      error: (e) => {
        this.pushAlert('danger', 'Falha', e?.error?.message || 'Não foi possível carregar a promoção.');
      }
    });
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.clearAlerts();
    if (!file) return;

    const valid = ['image/jpeg', 'image/png'];
    if (!valid.includes(file.type)) {
      this.pushAlert('danger', 'Formato inválido', 'A imagem deve ser JPG ou PNG.');
      this.form.patchValue({ imageFile: null });
      this.previewUrl = null;
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.pushAlert('danger', 'Arquivo grande', 'Tamanho máximo de 5MB.');
      this.form.patchValue({ imageFile: null });
      this.previewUrl = null;
      return;
    }

    this.selectedFile = file;
    this.form.patchValue({ imageFile: file });

    const reader = new FileReader();
    reader.onload = () => { this.previewUrl = reader.result as string; };
    reader.onerror = () => {
      this.pushAlert('danger', 'Falha na prévia', 'Não foi possível ler a imagem.');
      this.previewUrl = null;
    };
    reader.readAsDataURL(file);
  }

  pickService(opt: ServiceOption) {
    this.form.get('serviceId')!.setValue(opt.id);
    this.serviceQuery = opt.title;
  }

  searchServices(q: string) {
    this.serviceQuery = q;
    this.serviceSearch$.next(q);
  }

  labelForCta(t: string | null | undefined): string {
    switch (t) {
      case 'SEE_MORE':   return 'Ver mais';
      case 'BOOK_NOW':   return 'Reservar';
      case 'CONTACT_US': return 'Fale conosco';
      default:           return 'Ver mais';
    }
  }

  async savePromotion() {
    this.clearAlerts();

    if (!this.isEdit && (this.form.invalid || !this.selectedFile)) {
      this.form.markAllAsTouched();
      this.pushAlert('warning', 'Campos obrigatórios', 'Verifique o formulário.');
      return;
    }
    if (this.isEdit && this.form.invalid) {
      this.form.markAllAsTouched();
      this.pushAlert('warning', 'Campos obrigatórios', 'Verifique o formulário.');
      return;
    }

    try {
      this.saving = true;

      let imageUrlToSend: string | null = this.existingImageUrl || null;

      if (this.selectedFile) {
        const uploadResp: any = await firstValueFrom(this.callImageUpload(this.selectedFile));
        const imageUrl = this.extractUrl(uploadResp);
        if (!imageUrl) throw new Error('Falha ao obter URL da imagem do upload.');
        imageUrlToSend = imageUrl;
      }

      const v = this.form.value;
      const payload: any = {
        title: (v.title || '').trim(),
        description: (v.description || '').trim(),
        promotionType: v.type as UiActionType,
        ctaButtonType: v.ctaButtonType as CtaButtonTypeEnum,
        imageUrl: imageUrlToSend,
        startDate: v.startDate,
        endDate: v.endDate
      };

      if (v.type === 'EXTERNAL_LINK') payload.targetUrl = (v.externalLink || '').trim();
      if (v.type === 'SERVICE_LINK')  payload.serviceId = Number(v.serviceId);

      if (!payload.imageUrl) {
        this.pushAlert('danger', 'Imagem obrigatória', 'Selecione uma imagem.');
        this.saving = false;
        return;
      }

      if (this.isEdit && this.promotionId) {
        await firstValueFrom(
          this.http.put(`${this.API_ROOT}/api/promotions/company/${this.promotionId}`, payload, { headers: this.authHeaders() })
        );
        this.pushAlert('success', 'Sucesso', 'Promoção atualizada com sucesso!');
      } else {
        await firstValueFrom(
          this.http.post(`${this.API_ROOT}/api/promotions/company`, payload, { headers: this.authHeaders() })
        );
        this.pushAlert('success', 'Sucesso', 'Promoção criada com sucesso!');
      }
    } catch (e: any) {
      console.error('Erro backend:', e?.error || e);
      const be = e?.error;
      const detailed =
        be?.message ||
        (Array.isArray(be?.errors) ? be.errors.join('; ') : '') ||
        be?.error ||
        e?.message;
      this.pushAlert('danger', 'Falha', detailed || 'Erro ao salvar promoção.');
    } finally {
      this.saving = false;
    }
  }

  private callImageUpload(file: File) {
    const img: any = this.imageService as any;
    if (typeof img.uploadImage === 'function') return img.uploadImage(file);
    if (typeof img.upload === 'function') return img.upload(file);
    if (typeof img.enviar === 'function') return img.enviar(file);
    if (typeof img.send === 'function') return img.send(file);
    return of({ url: '' });
  }

  private extractUrl(resp: any): string {
    if (!resp) return '';
    if (typeof resp === 'string') return resp;
    return resp.url || resp.link || resp.secure_url || resp?.data?.url || '';
  }

  fileNameFromUrl(url: string): string {
    try {
      const clean = url.split('?')[0].split('#')[0];
      return decodeURIComponent(clean.substring(clean.lastIndexOf('/') + 1));
    } catch { return 'imagem.jpg'; }
  }

  private pushAlert(type: IAlert['type'], strong: string, message: string) {
    this.alerts.push({ id: Date.now(), type, strong, message });
  }
  private clearAlerts() { this.alerts = []; }
  closeAlert(alert: IAlert) { this.alerts = this.alerts.filter(a => a.id !== alert.id); }

  ngOnDestroy(): void {
    this.destroy$.next(); this.destroy$.complete();
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
  }
}
