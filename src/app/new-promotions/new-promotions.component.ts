import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of, Observable, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ImageService } from '../services/image.service';
import { ServicesService } from '../services/services.service';
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

/** Regra: fim >= início; duração <= 30d; start >= hoje; end > hoje */
function dateRangeValidator(ctrl: AbstractControl): ValidationErrors | null {
  const start = ctrl.get('startDate')?.value;
  const end = ctrl.get('endDate')?.value;
  if (!start || !end) return null;

  const s = new Date(start);
  const e = new Date(end);
  const today = new Date(); today.setHours(0,0,0,0);

  const errors: any = {};
  if (e < s) errors.endBeforeStart = true;

  const diff = Math.floor((e.getTime() - s.getTime()) / (24 * 3600 * 1000)) + 1;
  if (diff > 30) errors.rangeMax30 = true;

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

  public alerts: Array<IAlert> = [];
  saving = false;
  searching = false;

  /** Form para UI + DTO */
  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],

    // CTA do DTO
    ctaButtonType: ['SEE_MORE' as CtaButtonTypeEnum, [Validators.required]],

    // controla campos condicionais na UI (vira promotionType no payload)
    type: ['PROFILE_REDIRECT' as UiActionType, Validators.required],
    externalLink: [''],                 // -> targetUrl (se EXTERNAL_LINK)
    serviceId: [null as number | null], // -> serviceId (se SERVICE_LINK)

    startDate: ['', Validators.required],
    endDate: ['', Validators.required],

    imageFile: [null as File | null, Validators.required], // só no FE
  }, { validators: [dateRangeValidator] });

  previewUrl: string | null = null;
  selectedFile: File | null = null;

  serviceQuery = '';
  serviceOptions: ServiceOption[] = [];
  private serviceSearch$ = new Subject<string>();

  private destroy$ = new Subject<void>();
  private API_ROOT = environment.backendApiUrl; // ex.: http://localhost:8082

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private imageService: ImageService,
    private servicesService: ServicesService
  ) {}

  ngOnInit(): void {
    // validações condicionais
    this.form.get('type')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((type: UiActionType) => {
        const link = this.form.get('externalLink')!;
        const svc  = this.form.get('serviceId')!;
        link.clearValidators();
        svc.clearValidators();

        if (type === 'EXTERNAL_LINK') {
          link.setValidators([
            Validators.required,
            Validators.maxLength(500),
            Validators.pattern(/^https?:\/\/.+/i),
          ]);
        } else if (type === 'SERVICE_LINK') {
          svc.setValidators([Validators.required]);
        }
        link.updateValueAndValidity();
        svc.updateValueAndValidity();
      });

    // busca serviços
    this.serviceSearch$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          this.searching = true;
          return this.callServiceSearch(q);
        })
      )
      .subscribe({
        next: (opts: any) => {
          this.serviceOptions = (opts || []).map((x: any) => ({
            id: x.id ?? x.idService ?? x.serviceId,
            title: x.title ?? x.name ?? x.serviceName ?? x.descricao ?? 'Serviço'
          } as ServiceOption));
          this.searching = false;
        },
        error: () => { this.serviceOptions = []; this.searching = false; }
      });
  }

  /** Compat: diferentes assinaturas do ServicesService */
  private callServiceSearch(q: string): Observable<any[]> {
    const svc: any = this.servicesService as any;
    if (typeof svc.search === 'function') return svc.search(q);
    if (typeof svc.listarServicos === 'function') return svc.listarServicos(q);
    if (typeof svc.getAll === 'function') return svc.getAll({ q });
    if (typeof svc.buscar === 'function') return svc.buscar(q);
    return of([]);
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

  /** texto do botão na prévia para os 3 CTAs do back */
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

    if (this.form.invalid || !this.selectedFile) {
      this.form.markAllAsTouched();
      this.pushAlert('warning', 'Campos obrigatórios', 'Verifique o formulário.');
      return;
    }

    try {
      this.saving = true;

      // 1) upload da imagem
      const uploadResp: any = await firstValueFrom(this.callImageUpload(this.selectedFile!));
      const imageUrl = this.extractUrl(uploadResp);
      if (!imageUrl) throw new Error('Falha ao obter URL da imagem do upload.');

      // 2) payload EXATO do DTO
      const v = this.form.value;
      const payload: any = {
        title: (v.title || '').trim(),
        description: (v.description || '').trim(),
        promotionType: v.type as UiActionType,            // enum do back
        ctaButtonType: v.ctaButtonType as CtaButtonTypeEnum, // enum do back
        imageUrl,
        startDate: v.startDate,
        endDate: v.endDate
        // opcional:
        // imageAspectRatio: '3:4'
      };

      if (v.type === 'EXTERNAL_LINK') {
        payload.targetUrl = (v.externalLink || '').trim();
      }
      if (v.type === 'SERVICE_LINK') {
        payload.serviceId = Number(v.serviceId);
      }

      console.log('POST payload ->', payload);

      // 3) POST para o back
      await firstValueFrom(this.http.post(
        `${this.API_ROOT}/api/promotions/company`,
        payload
      ));

      this.pushAlert('success', 'Sucesso', 'Promoção criada com sucesso!');
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

  private callImageUpload(file: File): Observable<any> {
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
