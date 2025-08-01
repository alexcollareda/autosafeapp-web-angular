import { CepService } from 'app/services/cep.service';
import { CompanyTypesService } from './../services/company-types.service';
import { CompaniesService } from 'app/services/companies.service';
import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageService } from 'app/services/image.service';

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
  address: Address = {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    complement: '',
    latitude: 0,
    longitude: 0
  };
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
  oldUrlImage: string = '';
  preview: string;
  currentFile: File;
  selectedFiles: any;
   private readonly VALID_UFS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];


  constructor(private companiesService: CompaniesService, private companyTypesService: CompanyTypesService, private modalService: NgbModal, private cepService: CepService, private imageService: ImageService) { }

  ngOnInit(): void {
    
    this.companiesService.getCompanyById().subscribe(
      (data) => {
        console.log('Dados da empresa:', data);
        this.loadCompanyTypes();
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
    if (this.logoUrl) {
      this.oldUrlImage = this.logoUrl;
    }
    this.logoUrl = '';
    this.preview = '';
    this.createAlert('success', '', 'Imagem excluída com sucesso.');
    this.modalService.dismissAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (this.validateCompany()) {
      if (this.currentFile) {
        this.imageService.uploadImage(this.currentFile).subscribe({
          next: (response: string) => {
            console.log('Imagem enviada com sucesso:', response);
            this.logoUrl = response;
            this.updateCompany();
          },
          error: (error) => {
            console.error('Erro ao enviar imagem:', error);
          }
        });

        if (this.oldUrlImage) {
          this.imageService.deleteImageByUrl(this.oldUrlImage).subscribe({
            next: (response) => {
              console.log('Imagem excluída com sucesso:', response);
            },
            error: (error) => {
              console.error('Erro ao excluir imagem:', error);
              this.createAlert('danger', 'Erro!', 'Ocorreu um erro ao excluir a imagem.');
            }
          });
        }
      }else{
        this.updateCompany();
      }

    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateCompany() {
    this.companiesService.updateCompany({
      cnpj: this.cnpj,
      name: this.companyName,
      phone: this.phone,
      email: this.email,
      description: this.description,
      logoUrl: this.logoUrl,
      address: this.address,
      types: this.selectedCompanyTypeIds,
      active: this.active
    }).subscribe({
      next: (response) => {
        console.log('Empresa atualizada com sucesso:', response);
        this.createAlert('success', 'Sucesso!', 'Empresa atualizada com sucesso.');
        this.ngOnInit();
      }
      , error: (error) => {
        console.error('Erro ao atualizar empresa:', error);
        this.createAlert('danger', 'Erro!', 'Ocorreu um erro ao atualizar a empresa.');
      }
    });
  }

  validateCompany() {
    if (!this.companyName) {
      this.createAlert('danger', '', 'Nome da empresa deve ser informado.');
      return false;
    }
    if (!this.phone) {
      this.createAlert('danger', '', 'Telefone deve ser informado.');
      return false;
    }
    if (!this.email) {
      this.createAlert('danger', '', 'E-mail deve ser informado.');
      return false;
    }
    if (!this.address.zipCode) {
      this.createAlert('danger', '', 'CEP deve ser informado.');
      return false;
    }
    if (!this.address.street) {
      this.createAlert('danger', '', 'Rua deve ser informado.');
      return false;
    }
    if (!this.address.neighborhood) {
      this.createAlert('danger', '', 'Bairro deve ser informado.');
      return false;
    }
    if (!this.address.city) {
      this.createAlert('danger', '', 'Cidade deve ser informada.');
      return false;
    }
    if (!this.address.state) {
      this.createAlert('danger', '', 'Estado deve ser informado.');
      return false;
    }

    if (!this.isValidUF(this.address.state)) {
      this.createAlert('danger', 'Erro!', 'O valor informado para o Estado não é uma UF válida do Brasil.');
      return false;
    }
    if (!this.address.number) {
      this.createAlert('danger', '', 'Número do endereco deve ser informado.');
      return false;
    }

    if (!this.selectedCompanyTypeIds || this.selectedCompanyTypeIds.length === 0) {
      this.createAlert('danger', '', 'Pelo menos um tipo de empresa deve ser selecionado.');
      return false;
    }

    return true;
  }

    private isValidUF(uf: string): boolean {
    return this.VALID_UFS.includes(uf);
  }

  selectFile(event: any): void {
    this.preview = '';
    this.selectedFiles = event.target.files;

    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        this.preview = '';
        this.currentFile = file;

        const reader = new FileReader();

        reader.onload = (e: any) => {
          console.log(e.target.result);
          this.preview = e.target.result;
        };

        reader.readAsDataURL(this.currentFile);
      }
    }
  }

}
