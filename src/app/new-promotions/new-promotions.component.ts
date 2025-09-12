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

/** Validador de faixa de datas (propaga erros para os campos também) */
function dateRangeValidator(ctrl: AbstractControl): ValidationErrors | null {
  const startCtrl = ctrl.get('startDate');
  const endCtrl   = ctrl.get('endDate');

  const start = startCtrl?.value as string | undefined;
  const end   = endCtrl?.value as string | undefined;

  // limpa apenas os erros que este validador controla
  const clean = (errors: ValidationErrors | null | undefined, keys: string[]) => {
    if (!errors) return null;
    const copy: any = { ...errors };
    keys.forEach(k => delete copy[k]);
    return Object.keys(copy).length ? copy : null;
  };
  startCtrl?.setErrors(clean(startCtrl?.errors, ['startInPast']));
  endCtrl?.setErrors(clean(endCtrl?.errors, ['endBeforeStart', 'rangeMax30', 'endNotFuture']));

  if (!start || !end) return null;

  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const formErrors: any = {};

  if (e < s) formErrors.endBeforeStart = true;

  const oneDay = 24 * 3600 * 1000;
  const diffDays = Math.floor((e.getTime() - s.getTime()) / oneDay) + 1;
  if (diffDays > 30) formErrors.rangeMax30 = true;

  if (s < today)  formErrors.startInPast = true;
  if (e <= today) formErrors.endNotFuture = true;

  if (formErrors.startInPast && startCtrl) {
    const prev = startCtrl.errors || {};
    startCtrl.setErrors({ ...prev, startInPast: true });
  }
  if ((formErrors.endBeforeStart || formErrors.rangeMax30 || formErrors.endNotFuture) && endCtrl) {
    const prev = endCtrl.errors || {};
    endCtrl.setErrors({
      ...prev,
      ...(formErrors.endBeforeStart ? { endBeforeStart: true } : {}),
      ...(formErrors.rangeMax30 ? { rangeMax30: true } : {}),
      ...(formErrors.endNotFuture ? { endNotFuture: true } : {}),
    });
  }

  return Object.keys(formErrors).length ? formErrors : null;
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

  ngOnInit(): void {
    const idStr = this.route.snapshot.queryParamMap.get('promotionId');
    this.isEdit = !!idStr;
    this.promotionId = idStr ? Number(idStr) : null;

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
          this.computeServiceOptions(this.serviceQuery);
        }
        link.updateValueAndValidity();
        svc.updateValueAndValidity();
      });

    this.serviceSearch$
      .pipe(takeUntil(this.destroy$), debounceTime(250), distinctUntilChanged())
      .subscribe(q => this.computeServiceOptions(q));

    this.loadMyServices();

    if (this.isEdit && this.promotionId) {
      this.loadPromotion(this.promotionId);
      this.form.get('imageFile')!.clearValidators();
      this.form.get('imageFile')!.updateValueAndValidity();
    }
  }

  private async loadMyServices(): Promise<void> {
    try {
      const list: any[] = await firstValueFrom(
        this.http.get<any[]>(`${this.API_ROOT}/public/services`, { headers: this.authHeaders() })
      );
      this.allMyServices = (list || []).map(this.mapService);
    } catch (e: any) {
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

  private computeServiceOptions(query: string): void {
    const q = (query || '').trim().toLowerCase();
    const base = this.allMyServices || [];
    const filtered = q
      ? base.filter(s => (s.title || '').toLowerCase().includes(q))
      : base.slice(0, 100);
    this.serviceOptions = filtered.slice(0, 40);
  }

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

  /** Monta mensagens específicas do que está faltando/errado para o alerta de topo */
  private collectValidationErrors(): string[] {
    const msgs: string[] = [];
    const f = this.form;

    if (f.get('title')?.hasError('required')) msgs.push('Título é obrigatório');
    if (f.get('title')?.hasError('maxlength')) msgs.push('Título: máximo 80 caracteres');

    if (f.get('description')?.hasError('required')) msgs.push('Descrição é obrigatória');
    if (f.get('description')?.hasError('maxlength')) msgs.push('Descrição: máximo 500 caracteres');

    if (f.get('ctaButtonType')?.hasError('required')) msgs.push('Selecione o tipo do botão (CTA)');
    if (f.get('type')?.hasError('required')) msgs.push('Selecione o tipo');

    if (f.get('type')?.value === 'EXTERNAL_LINK') {
      const linkCtrl = f.get('externalLink');
      if (linkCtrl?.hasError('required')) msgs.push('Link externo é obrigatório');
      if (linkCtrl?.hasError('pattern')) msgs.push('URL do link externo é inválida (use http/https)');
      if (linkCtrl?.hasError('maxlength')) msgs.push('Link externo muito longo (máx. 500)');
    }

    if (f.get('type')?.value === 'SERVICE_LINK') {
      if (f.get('serviceId')?.hasError('required')) msgs.push('Selecione um serviço');
    }

    const sCtrl = f.get('startDate');
    const eCtrl = f.get('endDate');
    if (sCtrl?.hasError('required')) msgs.push('Data de início é obrigatória');
    if (eCtrl?.hasError('required')) msgs.push('Data de término é obrigatória');

    const fe = f.errors || {};
    if (fe['startInPast'] || sCtrl?.hasError('startInPast')) msgs.push('Data de início não pode ser no passado');
    if (fe['endNotFuture'] || eCtrl?.hasError('endNotFuture')) msgs.push('Data de término deve ser futura');
    if (fe['endBeforeStart'] || eCtrl?.hasError('endBeforeStart')) msgs.push('Data de término deve ser igual ou posterior à data de início');
    if (fe['rangeMax30'] || eCtrl?.hasError('rangeMax30')) msgs.push('Período máximo permitido é de 30 dias');

    if (!this.isEdit && f.get('imageFile')?.hasError('required')) msgs.push('Selecione uma imagem (JPG/PNG até 5MB)');

    if (msgs.length === 0) msgs.push('Verifique os campos destacados.');
    return msgs;
  }

  async savePromotion() {
    this.clearAlerts();

    // força cálculo das validações antes do submit
    this.form.updateValueAndValidity({ emitEvent: true });

    if (!this.isEdit && (this.form.invalid || !this.selectedFile)) {
      this.form.markAllAsTouched();
      const msgs = this.collectValidationErrors();
      this.pushAlert('warning', 'Campos obrigatórios', msgs.join(' | '));
      return;
    }
    if (this.isEdit && this.form.invalid) {
      this.form.markAllAsTouched();
      const msgs = this.collectValidationErrors();
      this.pushAlert('warning', 'Campos obrigatórios', msgs.join(' | '));
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
