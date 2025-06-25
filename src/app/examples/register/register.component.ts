import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


interface CompanyType {
  id: number;
  name: string;
  iconUrl: string | null;
  description: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  companyTypes: CompanyType[] = [];
  selectedCompanyTypeIds: number[] = [];

  cnpj: string = '';
  razaoSocial: string = '';
  nomeFantasia: string = '';
  cep: string = '';
  rua: string = '';
  bairro: string = '';
  cidade: string = '';
  estado: string = '';
  numero: string = '';
  telefone: string = '';
  celular: string = '';
  isWatsApp: boolean = false;
  email: string = '';
  focus;
  focus1;

  step: number = 1; // Controla o passo do formulário
  buttonDescription: string = 'Continuar Cadastro';

  constructor(private http: HttpClient) {}

 ngOnInit() {
        var body = document.getElementsByTagName('body')[0];
        body.classList.add('register-page');

        var navbar = document.getElementsByTagName('nav')[0];
        navbar.classList.add('navbar-transparent');

        this.loadCompanyTypes();
    }
    ngOnDestroy(){
        var body = document.getElementsByTagName('body')[0];
        body.classList.remove('register-page');

        var navbar = document.getElementsByTagName('nav')[0];
        navbar.classList.remove('navbar-transparent');
    }

loadCompanyTypes() {
    this.http.get<CompanyType[]>('http://localhost:8082/company-types')
      .subscribe({
        next: (data) => {
          this.companyTypes = data;
        },
        error: () => {
          this.companyTypes = [];
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

  onCnpjBlur() {
    if (this.cnpj && this.cnpj.length === 14) {
      this.http.get<any>(`https://open.cnpja.com/office/${this.cnpj}`)
        .subscribe({
          next: (data) => {
            this.razaoSocial = data.company?.name || '';
            this.nomeFantasia = data.alias || '';
            this.cep = data.address?.zip || '';
            this.numero = data.address?.number || '';
            // Busca o endereço pelo CEP no serviço local
            if (this.cep) {
              this.buscarCep();
            } else {
              this.rua = '';
              this.bairro = '';
              this.cidade = '';
              this.estado = '';
            }
          },
          error: () => {
            this.razaoSocial = '';
            this.nomeFantasia = '';
            this.cep = '';
            this.rua = '';
            this.numero = '';
            this.bairro = '';
            this.cidade = '';
            this.estado = '';
          }
        });
    }
  }

  buscarCep() {
    if (this.cep) {
      this.http.get<any>(`http://localhost:8082/cep/${this.cep}`)
        .subscribe({
          next: (cepData) => {
            this.rua = cepData.logradouro || '';
            this.bairro = cepData.bairro || '';
            this.cidade = cepData.localidade || '';
            this.estado = cepData.uf || '';
          },
          error: () => {
            this.rua = '';
            this.bairro = '';
            this.cidade = '';
            this.estado = '';
          }
        });
    }
  }
  nextStep() {
      this.validateFields()
      this.step++;
      if(this.step === 3) {
            this.buttonDescription = 'Finalizar';
        } else {
            this.buttonDescription = 'Continuar Cadastro';
        }
  }

  backStep() {
      if (this.step > 1) {
            this.step--;
            if(this.step === 3) {
                this.buttonDescription = 'Finalizar';
            } else {
                this.buttonDescription = 'Continuar Cadastro';
            }
        }
}

validateFields() {
    if (this.step === 1) {
        // Validação do step 1
    }

    if (this.step === 2) {
        // Validação do step 2
    }

    if (this.step === 3) {
        // Validação do step 3
    }
}
}