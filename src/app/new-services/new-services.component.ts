import { ServicesService } from './../services/services.service';
import { CompanyTypesService } from './../services/company-types.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrandService } from 'app/services/brand.service';
import { ModelService } from 'app/services/model.service';
import { Observable, of, firstValueFrom } from 'rxjs';
import { ImageService } from 'app/services/image.service'; // upload de imagem
import { AuthService } from 'app/services/auth.service';

interface CompanyType {
  id: number;
  name: string;
  iconUrl: string | null;
  description: string;
}

interface Service {
  id: number;
  title: string;
  description: string;
  price: any;
  priceType: string;
  imageUrl: string;
  appliesToAllVehicles: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: number;
  companyTypeId: number;
  brands: Brand[];
  models: Model[];
}
interface serviceRequest {
  title: string;
  description: string;
  price: any;
  priceType: string;
  imageUrl: string;
  appliesToAllVehicles: boolean;
  isActive: boolean;
  companyTypeId: number;
  brandIds: number[];
  modelIds: number[];
}

interface PriceTypeOption {
  value: string;
  label: string;
}

interface Brand {
  idBrand: number;
  name: string;
  brandUrlLogo: string | null;
}
interface Model {
  idModel: number;
  name: string;
  brand: Brand;
}

interface brandModelSelected {
  brand: Brand | null;
  model: Model | null;
}

export interface IAlert {
  id: number;
  type: string;
  strong?: string;
  message: string;
  icon?: string;
}

@Component({
  selector: 'app-new-services',
  templateUrl: './new-services.component.html',
  styleUrls: ['./new-services.component.scss']
})
export class NewServicesComponent implements OnInit {

  serviceId: number | null = null;
  serviceId$: Observable<number | null>;
  companyTypes: CompanyType[] = [];
  service: Service = {} as Service;
  serviceRequest: serviceRequest = {} as serviceRequest;
  selectedCompanyTypeIds: number;
  priceTypes: PriceTypeOption[] = [];
  priceTypeSelected: PriceTypeOption;
  brandList: Brand[] = [];
  filteredBrandList: Brand[] = [];
  searchBrandTerm: string = '';
  brandSelected: Brand | null = null;
  modelList: Model[] = [];
  filteredModelList: Model[] = [];
  searchModelTerm: string = '';
  modelSelected: Model | null = null;
  listBrandModelSelected: brandModelSelected[] = [];
  public alerts: Array<IAlert> = [];

  // Upload / Preview 1:1
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  previewUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private companyTypesService: CompanyTypesService,
    private brandService: BrandService,
    private modelService: ModelService,
    private servicesService: ServicesService,
    private imageService: ImageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  this.serviceId = null;
  this.selectedCompanyTypeIds = 0;

  // 1. Tenta pegar o service passado pelo state
  const navState = history.state;
  if (navState && navState.service) {
    // Já veio o objeto inteiro
    this.service = navState.service;
    this.serviceId = this.service.id;

    this.selectedCompanyTypeIds = this.service.companyTypeId;
    this.priceTypeSelected = this.priceTypes.find(pt => pt.value === this.service.priceType) || null;
    this.previewUrl = this.service?.imageUrl || null;

    if (this.service.brands?.length) {
      this.service.brands.forEach(b => this.listBrandModelSelected.push({ brand: b, model: null }));
    }

    if (this.service.models?.length) {
      this.service.models.forEach(m => this.listBrandModelSelected.push({ brand: m.brand, model: m }));
    }
  } else {
    // 2. Se não veio pelo state, usa queryParam e API
    const serviceIdString = this.route.snapshot.queryParamMap.get('serviceId');
    if (serviceIdString) this.serviceId = +serviceIdString;

    if (!this.serviceId) {
      this.service.isActive = true;
      this.service.appliesToAllVehicles = true;
    }

    if (this.serviceId && this.serviceId !== 0) {
      this.servicesService.findByServiceId(this.serviceId).subscribe((data) => {
        this.service = data;

        this.selectedCompanyTypeIds = this.service.companyTypeId;
        this.priceTypeSelected = this.priceTypes.find(pt => pt.value === this.service.priceType) || null;
        this.previewUrl = this.service?.imageUrl || null;

        if (this.service.brands?.length) {
          this.service.brands.forEach(b => this.listBrandModelSelected.push({ brand: b, model: null }));
        }

        if (this.service.models?.length) {
          this.service.models.forEach(m => this.listBrandModelSelected.push({ brand: m.brand, model: m }));
        }
      });
    }
  }

  // Carregar tipos e marcas (mantém igual)
  this.companyTypesService.getMyCompanyTypes().subscribe({
    next: (data) => this.companyTypes = data,
    error: () => {}
  });

  this.priceTypes = [
    { value: 'EXACT', label: 'Fixo' },
    { value: 'STARTING_FROM', label: 'A Partir de' }
  ];

  this.brandService.getAllBrands(this.authService.getCompanyVehicle()).subscribe({
    next: (data) => { this.brandList = data; this.filteredBrandList = this.brandList.slice(0, 5); },
    error: () => {}
  });


    // Edição: carrega dados do serviço
    if (this.serviceId && this.serviceId !== 0) {
      this.servicesService.findByServiceId(this.serviceId).subscribe((data) => {
        this.service = data;

        this.selectedCompanyTypeIds = this.service.companyTypeId;
        this.priceTypeSelected = this.priceTypes.find(pt => pt.value === this.service.priceType) || null;

        // prévia inicial (imagem existente)
        this.previewUrl = this.service?.imageUrl || null;

        if (this.service.brands?.length) {
          this.service.brands.forEach(b => {
            const item: brandModelSelected = { brand: b, model: null };
            this.listBrandModelSelected.push(item);
          });
        }

        if (this.service.models?.length) {
          this.service.models.forEach(m => {
            const item: brandModelSelected = { brand: m.brand, model: m };
            this.listBrandModelSelected.push(item);
          });
        }
      });
    }
  }

  // =================== IMAGEM (input + preview 1:1) ===================
  onImageChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    this.selectedFile = null;
    this.selectedFileName = null;
    this.previewUrl = this.service?.imageUrl || null;

    if (!file) return;

    const valid = ['image/jpeg', 'image/png'];
    if (!valid.includes(file.type)) {
      this.createAlert('danger', '', 'A imagem deve ser JPG ou PNG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.createAlert('danger', '', 'Tamanho máximo de 5MB.');
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string); // 1:1 no CSS
    reader.readAsDataURL(file);
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

  getFileNameFromUrl(url: string): string {
    try {
      const noQuery = url.split('?')[0].split('#')[0];
      const name = noQuery.substring(noQuery.lastIndexOf('/') + 1);
      return decodeURIComponent(name || 'imagem.jpg');
    } catch {
      return 'imagem.jpg';
    }
  }
  // ====================================================================

  toggleCompanyType(id: number) {
    this.selectedCompanyTypeIds = id;
  }

  isCompanyTypeSelected(id: number): boolean {
    return this.selectedCompanyTypeIds === id;
  }

  selectPriceType(priceType: PriceTypeOption) {
    this.priceTypeSelected = priceType;
  }

  onBrandSearchChange(): void { this.filterBrands(); }

  filterBrands(): void {
    if (!this.searchBrandTerm?.trim()) { this.filteredBrandList = this.brandList; return; }
    const q = this.searchBrandTerm.toLowerCase();
    const filtered = this.brandList.filter(b => b.name.toLowerCase().includes(q));
    this.filteredBrandList = filtered.length > 0 ? filtered.slice(0, 5) : [];
  }

  setBrandSelected(brand: Brand): void {
    this.brandSelected = brand;
    this.searchModelByBrand();
  }

  searchModelByBrand(): void {
    if (this.brandSelected) {
      this.modelService.getModelByBrand(this.brandSelected.idBrand).subscribe({
        next: (data) => { this.modelList = data; this.filteredModelList = this.modelList ? this.modelList.slice(0, 5) : []; },
        error: () => { }
      });
    }
  }

  onModelSearchChange(): void { this.filterModels(); }

  filterModels(): void {
    if (!this.searchModelTerm?.trim()) { this.filteredModelList = this.modelList; return; }
    const q = this.searchModelTerm.toLowerCase();
    this.filteredModelList = this.modelList
      ?.filter(m => m.name.toLowerCase().includes(q))
      ?.slice(0, 5) ?? [];
  }

  setModelSelected(model: Model): void {
    this.modelSelected = model;
  }

  addBrandModelToList(): void {
    if (this.brandSelected || this.modelSelected) {
      const item: brandModelSelected = { brand: this.brandSelected, model: this.modelSelected };
      this.listBrandModelSelected.push(item);
      this.brandSelected = null;
      this.modelSelected = null;
      this.searchBrandTerm = '';
      this.searchModelTerm = '';
      this.filteredModelList = [];
    }
  }

  removeBrandModelSelected(index: number): void {
    if (index > -1 && index < this.listBrandModelSelected.length) {
      this.listBrandModelSelected.splice(index, 1);
    }
  }
  createRequestObject() {
    this.serviceRequest.title = this.service.title;
    this.serviceRequest.description = this.service.description;
    this.serviceRequest.price = this.service.price;
    this.serviceRequest.priceType = this.service.priceType;
    this.serviceRequest.imageUrl = this.service.imageUrl;
    this.serviceRequest.appliesToAllVehicles = this.service.appliesToAllVehicles;
    this.serviceRequest.isActive = this.service.isActive;
    this.serviceRequest.companyTypeId = this.selectedCompanyTypeIds;
  }

  async saveService() {
    this.service.companyTypeId = this.selectedCompanyTypeIds;
    this.service.priceType = this.priceTypeSelected?.value;
    this.createRequestObject();
    if (this.validateService()) {
      if (this.service.appliesToAllVehicles) {
        this.serviceRequest.brandIds = [];
        this.serviceRequest.modelIds = [];
        this.service.brands = [];
        this.service.models = [];
      } else {
        this.serviceRequest.brandIds = this.listBrandModelSelected
          .map(item => (item.brand ? item.brand.idBrand : null))
          .filter((id): id is number => id !== null);
        this.serviceRequest.modelIds = this.listBrandModelSelected
          .map(item => (item.model ? item.model.idModel : null))
          .filter((id): id is number => id !== null);
      }
      try {
        // Upload somente se o usuário escolheu novo arquivo
        if (this.selectedFile) {
          const uploadResp = await firstValueFrom(this.callImageUpload(this.selectedFile));
          const imageUrl = this.extractUrl(uploadResp);
          if (!imageUrl) {
            this.createAlert('danger', '', 'Falha ao enviar a imagem.');
            return;
          }
          this.service.imageUrl = imageUrl;
          this.serviceRequest.imageUrl = imageUrl;
        } else {
          // Em criação, exige imagem
          if (!this.serviceId || this.serviceId === 0) {
            this.createAlert('danger', '', 'Selecione uma imagem para o serviço.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          // Em edição sem novo arquivo, mantém a URL existente
        }

        if (this.serviceId === null || this.serviceId === 0) {
          await firstValueFrom(this.servicesService.createService(this.serviceRequest));
          this.createAlert('success', '', 'Serviço salvo com sucesso!');
          this.clearInputs();
        } else {
          await firstValueFrom(this.servicesService.updateService(this.serviceId, this.serviceRequest));
          this.createAlert('success', '', 'Serviço atualizado com sucesso!');
          this.clearInputs();
        }
      } catch (error) {
        console.error('Erro ao salvar/atualizar serviço:', error);
        this.createAlert('danger', '', 'Erro ao salvar serviço. Tente novamente mais tarde.');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearInputs() {
    this.service = {} as Service;
    this.ngOnInit();
    this.selectedCompanyTypeIds = 0;
    this.priceTypeSelected = null;
    this.brandSelected = null;
    this.modelSelected = null;
    this.listBrandModelSelected = [];
    this.searchBrandTerm = '';
    this.searchModelTerm = '';
    this.filteredBrandList = this.brandList;
    this.filteredModelList = this.modelList;

    // limpa upload/preview
    this.selectedFile = null;
    this.selectedFileName = null;
    this.previewUrl = null;
  }

  validateService(): boolean {
    if (!this.service.companyTypeId) {
      this.createAlert('danger', '', 'Deve ser selecionado um tipo de Serviço.');
      return false;
    }
    if (!this.service.title || this.service.title.trim() === '') {
      this.createAlert('danger', '', 'Título deve ser informado.');
      return false;
    }
    if (!this.service.description || this.service.description.trim() === '') {
      this.createAlert('danger', '', 'Descrição deve ser informada.');
      return false;
    }
    if (!this.service.priceType) {
      this.createAlert('danger', '', 'Tipo do Preço deve ser informado.');
      return false;
    }
    if ((!this.service.price || this.service.price <= 0)) {
      this.createAlert('danger', '', 'Preço deve ser informado.');
      return false;
    }
    if (!this.service.appliesToAllVehicles && this.listBrandModelSelected.length === 0) {
      this.createAlert('danger', '', 'Deve deve ser selecionado Marca e Modelo quando o serviço não se aplica a todos os veículos.');
      return false;
    }
    return true;
  }

  createAlert(type: string, strong: string, message: string) {
    let icon = '';
    if (type === 'success') icon = 'ui-2_like';
    else if (type === 'danger') icon = 'objects_support-17';

    const newAlert: IAlert = { id: this.alerts.length + 1, type, strong, message, icon };
    this.alerts.push(newAlert);
    setTimeout(() => this.closeAlert(newAlert), 6000);
  }

  public closeAlert(alert: IAlert) {
    const index: number = this.alerts.indexOf(alert);
    this.alerts.splice(index, 1);
  }
}
