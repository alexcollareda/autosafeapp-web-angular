import { ServicesService } from './../services/services.service';
import { CompanyTypesService } from './../services/company-types.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrandService } from 'app/services/brand.service';
import { ModelService } from 'app/services/model.service';
import { map, Observable, filter } from 'rxjs';

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
  brands: number[];
  models: number[];
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

  constructor(private route: ActivatedRoute, private companyTypesService: CompanyTypesService, private brandService: BrandService, private modelService: ModelService, private servicesService: ServicesService) { }

  ngOnInit(): void {
    this.serviceId = null;
    this.selectedCompanyTypeIds = 0;

    const serviceIdString = this.route.snapshot.queryParamMap.get('serviceId');
    if (serviceIdString) {
      this.serviceId = +serviceIdString; // O '+' converte a string para número
      console.log('Service ID (from snapshot):', this.serviceId);
    }

    
    if (this.serviceId === null || this.serviceId === 0) {
      this.service.isActive = true;
      this.service.appliesToAllVehicles = true;
    }

    this.companyTypesService.getMyCompanyTypes().subscribe(
      (data) => {

        this.companyTypes = data;
        console.log('Tipos de empresa:', this.companyTypes);
      },
      (error) => {
        console.error('Erro ao buscar tipos de empresa:', error);
      }
    );
    this.priceTypes = [
      { value: 'EXACT', label: 'Fixo' },
      { value: 'STARTING_FROM', label: 'A Partir de' }
    ];

    this.brandService.getAllBrands().subscribe(
      (data) => {
        this.brandList = data;
        this.filteredBrandList = this.brandList;
      },
      (error) => {
      }
    );
    console.log('Carregando serviço com ID:', this.serviceId);
    if (this.serviceId !== 0) {
      console.log('Carregando serviço com ID:', this.serviceId);
      this.servicesService.findByServiceId(this.serviceId).subscribe(
        (data) => {
          this.service = data;
          this.selectedCompanyTypeIds = this.service.companyTypeId;
          this.priceTypeSelected = this.priceTypes.find(pt => pt.value === this.service.priceType) || null;

          if (this.service.brands && this.service.brands.length > 0) {
            this.brandSelected = this.brandList.find(b => this.service.brands.includes(b.idBrand)) || null;
          }

          if (this.service.models && this.service.models.length > 0) {
            this.modelSelected = this.modelList.find(m => this.service.models.includes(m.idModel)) || null;
          }

          console.log('Serviço carregado:', this.service);
        }

      );
    }
  }

  toggleCompanyType(id: number) {
    this.selectedCompanyTypeIds = id;
  }

  isCompanyTypeSelected(id: number): boolean {
    return this.selectedCompanyTypeIds === id;
  }
  selectPriceType(priceType: PriceTypeOption) {
    this.priceTypeSelected = priceType;
  }

  onBrandSearchChange(): void {
    this.filterBrands();
  }

  filterBrands(): void {
    if (!this.searchBrandTerm || this.searchBrandTerm.trim() === '') {
      // Se o campo de pesquisa estiver vazio, exibe a lista original completa
      this.filteredBrandList = this.brandList;
    } else {
      // Filtra a lista original com base no termo de pesquisa (case-insensitive)
      const lowerCaseSearchTerm = this.searchBrandTerm.toLowerCase();
      this.filteredBrandList = this.brandList.filter(brand =>
        brand.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
  }

  setBrandSelected(brand: Brand): void {
    console.log('Marca selecionada:', brand);
    this.brandSelected = brand;
    this.searchModelByBrand();
  }

  searchModelByBrand(): void {
    if (this.brandSelected) {
      this.modelService.getModelByBrand(this.brandSelected.idBrand).subscribe(
        (data) => {
          this.modelList = data;
          this.filteredModelList = this.modelList;
        },
        (error) => {
        }
      );
    }
  }

  onModelSearchChange(): void {
    this.filterModels();
  }

  filterModels(): void {
    if (!this.searchModelTerm || this.searchModelTerm.trim() === '') {
      // Se o campo de pesquisa estiver vazio, exibe a lista original completa
      this.filteredModelList = this.modelList;
    } else {
      // Filtra a lista original com base no termo de pesquisa (case-insensitive)
      const lowerCaseSearchTerm = this.searchModelTerm.toLowerCase();
      this.filteredModelList = this.modelList.filter(model =>
        model.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
  }

  setModelSelected(model: Model): void {
    console.log('Modelo selecionado:', model);
    this.modelSelected = model;
  }

  addBrandModelToList(): void {
    if (this.brandSelected || this.modelSelected) {
      const brandModel: brandModelSelected = {
        brand: this.brandSelected,
        model: this.modelSelected
      };
      this.listBrandModelSelected.push(brandModel);
      console.log('Marca e modelo selecionados:', brandModel);
      // Limpa as seleções após adicionar
      this.brandSelected = null;
      this.modelSelected = null;
      this.searchBrandTerm = '';
      this.searchModelTerm = '';
    } else {
      console.error('Selecione uma marca e um modelo antes de adicionar.');
    }
  }

  removeBrandModelSelected(index: number): void {
    if (index > -1 && index < this.listBrandModelSelected.length) {
      this.listBrandModelSelected.splice(index, 1);
      console.log('Marca e modelo removidos do índice:', index);
    } else {
      console.error('Índice inválido para remoção.', index);
    }
  }

  saveService() {
    this.service.companyTypeId = this.selectedCompanyTypeIds;
    this.service.priceType = this.priceTypeSelected.value;
    if (this.validateService()) {
      if (this.service.appliesToAllVehicles) {
        this.service.brands = [];
        this.service.models = [];
      } else {
        this.service.brands = this.listBrandModelSelected.map(item => item.brand ? item.brand.idBrand : null).filter(id => id !== null);
        this.service.models = this.listBrandModelSelected.map(item => item.model ? item.model.idModel : null).filter(id => id !== null);
      }

      if (this.serviceId === null || this.serviceId === 0) {

        this.servicesService.createService(this.service).subscribe(
          (response) => {
            this.createAlert('success', '', 'Serviço salvo com sucesso!');
            this.clearInputs();
          },
          (error) => {
            console.error('Erro ao salvar serviço:', error);
            this.createAlert('danger', '', 'Erro ao salvar serviço. Tente novamente mais tarde.');
          }
        );
      } else {
        this.servicesService.updateService(this.serviceId, this.service).subscribe(
          (response) => {
            this.createAlert('success', '', 'Serviço atualizado com sucesso!');
            this.clearInputs();
          },
          (error) => {
            console.error('Erro ao atualizar serviço:', error);
            this.createAlert('danger', '', 'Erro ao atualizar serviço. Tente novamente mais tarde.');
          }
        );
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
  }

  validateService(): boolean {
    if (!this.service.companyTypeId) {
      this.createAlert('danger', '', 'Deve ser selecionado um tipo de produto.');
      return false;
    }
    if (!this.service.title || this.service.title.trim() === '') {
      this.createAlert('danger', '', 'Titulo deve ser informado.');

      return false;
    }
    if (!this.service.description || this.service.description.trim() === '') {
      this.createAlert('danger', '', 'Descricao deve ser informada.');
      return false;
    }
    if (!this.service.priceType) {
      this.createAlert('danger', '', 'Tipo do Preco deve ser informado.');
      return false;
    }
    if ((!this.service.price || this.service.price <= 0)) {
      this.createAlert('danger', '', 'Preco deve ser informado.');
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
    if (type === 'success') {
      icon = 'ui-2_like';
    } else if (type === 'danger') {
      icon = 'objects_support-17';
    }

    const newAlert: IAlert = {
      id: this.alerts.length + 1,
      type,
      strong,
      message,
      icon
    };
    this.alerts.push(newAlert);
    setTimeout(() => {
      this.closeAlert(newAlert);
    }, 6000);
  }
  public closeAlert(alert: IAlert) {
    const index: number = this.alerts.indexOf(alert);
    this.alerts.splice(index, 1);
  }


}