import { CepService } from 'app/services/cep.service';
import { CompanyTypesService } from './../services/company-types.service';
import { CompaniesService } from 'app/services/companies.service';
import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface CompanyType {
  id: number;
  name: string;
  iconUrl: string | null;
  description: string;
}

interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
  latitude?: number;
  longitude?: number;
}

export interface IAlert {
  id: number;
  type: string;
  strong?: string;
  message: string;
  icon?: string;
}

@Component({
  selector: 'app-my-company',
  templateUrl: './my-company.component.html',
  styleUrls: ['./my-company.component.scss']
})
export class MyCompanyComponent implements OnInit {

  cnpj: string = '';
  companyName: string = '';
  phone: string = '';
  email: string = '';
  description: string = '';
  logoUrl: string = '';
  address: Address = null;
  types: CompanyType[] = [];
  active: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  distance: number = 0;
  rate: number = 0;
  companyTypes: CompanyType[] = [];
  selectedCompanyTypeIds: number[] = [];
  updateTypes: boolean = false;
  closeResult: string;
  public alerts: Array<IAlert> = [];


  constructor(private companiesService: CompaniesService, private companyTypesService: CompanyTypesService, private modalService: NgbModal, private cepService: CepService) { }

  ngOnInit(): void {
    this.companiesService.getCompanyById().subscribe(
      (data) => {
        console.log('Dados da empresa:', data);

        this.cnpj = data.cnpj;
        this.companyName = data.name;
        this.phone = data.phone;
        this.email = data.email;
        this.description = data.description;
        this.logoUrl = data.logoUrl;
        this.address = data.address;
        this.types = data.types;
        console.log('Tipos de empresa:', this.types);
        this.active = data.active;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.distance = data.distance;
        this.rate = data.rate;

        this.types.forEach(type => {
          this.toggleCompanyType(type.id);
        });
      }
    );

    this.loadCompanyTypes();
  }

  clickToUpdateType() {
    this.updateTypes = true;
  }

  loadCompanyTypes() {
    this.companyTypesService.getAllCompanyTypes().subscribe({
      next: (response) => {
        this.companyTypes = response;
      }
    });
  }

  toggleCompanyType(id: number) {
    const idx = this.selectedCompanyTypeIds.indexOf(id);
    if (idx > -1) {
      this.selectedCompanyTypeIds.splice(idx, 1); // Remove se já estiver selecionado
    } else {
      this.selectedCompanyTypeIds.push(id); // Adiciona se não estiver selecionado
    }
  }

  isCompanyTypeSelected(id: number): boolean {
    return this.selectedCompanyTypeIds.includes(id);
  }

  excluirImagem() {
    this.logoUrl = '';
    this.modalService.dismissAll();
  }

  open(content, type, modalDimension) {
    console.log('abrindo modal com tipo:', type, 'e dimensão:', modalDimension);
    if (modalDimension === 'sm' && type === 'modal_mini') {
      this.modalService.open(content, { windowClass: 'modal-mini modal-primary', size: 'sm' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    } else if (modalDimension == undefined && type === 'Login') {
      this.modalService.open(content, { windowClass: 'modal-login modal-primary' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    } else {
      this.modalService.open(content).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }

  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  buscarCep() {
    if (this.address.zipCode && this.address.zipCode.length === 8) {
      this.cepService.findCep(this.address.zipCode)
        .subscribe({
          next: (cepData) => {
            this.address.street = cepData.logradouro || '';
            this.address.neighborhood = cepData.bairro || '';
            this.address.city = cepData.localidade || '';
            this.address.state = cepData.uf || '';
          },
          error: () => {
            this.address.street = '';
            this.address.neighborhood = '';
            this.address.city = '';
            this.address.state = '';
          }
        });
    }
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

  saveCompany() {
    throw new Error('Method not implemented.');
  }

}
