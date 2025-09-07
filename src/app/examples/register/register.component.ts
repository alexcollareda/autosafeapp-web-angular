import { LoginCompanyService } from 'app/services/login-company.service';
import { CompanyTypesService } from './../../services/company-types.service';
import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CepService } from 'app/services/cep.service';
import { CompaniesService } from 'app/services/companies.service';
import { isValidCnpj } from '../../utils/cnpj.utils';


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
    @Input()
    public alerts: Array<IAlert> = [];
    companyTypes: CompanyType[] = [];
    selectedCompanyTypeIds: number[] = [];
    password: string = '';
    password2: string = '';
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
    companyId: number | null = null;
    isCnpjExiste = false; // Controla se o CNPJ já existe

    step: number = 1; // Controla o passo do formulário
    buttonDescription: string = 'Continuar Cadastro';

    constructor(private http: HttpClient, private companyTypesService: CompanyTypesService, private cepService: CepService, private companiesService: CompaniesService, private loginCompanyService: LoginCompanyService) { }


    ngOnInit() {
        var body = document.getElementsByTagName('body')[0];
        body.classList.add('register-page');

        var navbar = document.getElementsByTagName('nav')[0];
        navbar.classList.add('navbar-transparent');

        this.loadCompanyTypes();
    }
    ngOnDestroy() {
        var body = document.getElementsByTagName('body')[0];
        body.classList.remove('register-page');

        var navbar = document.getElementsByTagName('nav')[0];
        navbar.classList.remove('navbar-transparent');
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

    onCnpjBlur() {
        if (this.cnpj && this.cnpj.length === 14 && isValidCnpj(this.cnpj)) {
            // 1. Verifica se a empresa já está cadastrada no backend local
            this.isCnpjExiste = false;
            this.companiesService.getCompanyByCNPJ(this.cnpj)
                .subscribe({
                    next: (data) => {
                        
                        if (data && data.idCompany) {
                            this.createAlert('danger', 'Atenção!', 'Empresa já cadastrada.');
                            this.isCnpjExiste = true; // Marca que o CNPJ já existe
                            return;
                        }

                    }, error: () => {
                        this.isCnpjExiste = false;
                        this.http.get<any>(`https://open.cnpja.com/office/${this.cnpj}`)
                            .subscribe({
                                next: (data) => {
                                    this.razaoSocial = data.company?.name || '';
                                    this.nomeFantasia = data.alias || '';
                                    this.cep = data.address?.zip || '';
                                    this.numero = data.address?.number || '';
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
                                    this.bairro = '';
                                    this.cidade = '';
                                    this.estado = '';
                                    this.createAlert('danger', 'Erro!', 'Erro ao verificar CNPJ.');
                                }
                            });

                    }
                });
        }else{
            this.createAlert('danger', 'Atenção!', 'CNPJ Invalido.');
        }
    }

    buscarCep() {
        if (this.cep) {
            this.cepService.findCep(this.cep)
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
        if (this.validateFields()) {
            this.step++;
            if (this.step === 4) {
                this.buttonDescription = 'Finalizar';
            } else if (this.step === 5) {
                this.finalizarCadastro();
            } else {
                this.buttonDescription = 'Continuar Cadastro';
            }
        }
    }

    backStep() {
        if (this.step > 1) {
            this.step--;
            if (this.step === 4) {
                this.buttonDescription = 'Finalizar';
            } else {
                this.buttonDescription = 'Continuar Cadastro';
            }
        }
    }

    validateFields() {
        if (this.step === 1) {
            if (!isValidCnpj(this.cnpj)) {
                this.createAlert('danger', 'Atenção!', 'CNPJ inválido.');
                return false;
            }
            // Verifica se o CNPJ já existe
            if (this.isCnpjExiste) {
                this.createAlert('danger', 'Atenção!', 'CNPJ já cadastrado.');
                return false;
            }
            // Validação de campos obrigatórios
            if (!this.cnpj || !this.razaoSocial || !this.nomeFantasia || !this.telefone || !this.email) {
                this.createAlert('danger', 'Atenção!', 'Preencha todos os campos obrigatórios.');
                return false;
            }

            // Validação de CNPJ (apenas se quiser validar tamanho)
            if (this.cnpj.length !== 14) {
                this.createAlert('danger', 'Atenção!', 'CNPJ inválido.');
                return false;
            }

            // Validação de telefone (10 ou 11 dígitos, apenas números)
            const telefoneLimpo = this.telefone.replace(/\D/g, '');
            if (!(telefoneLimpo.length === 10 || telefoneLimpo.length === 11)) {
                this.createAlert('danger', 'Atenção!', 'Telefone inválido.');
                return false;
            }

            // Validação de e-mail
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.email)) {
                this.createAlert('danger', 'Atenção!', 'E-mail inválido.');
                return false;
            }
            return true;
        }

        if (this.step === 2) {
            if (!this.cep || !this.rua || !this.bairro || !this.cidade || !this.estado || !this.numero) {
                this.createAlert('danger', 'Atenção!', 'Preencha todos os campos de endereço.');
                return false;
            }

            // Validação de CEP (8 dígitos numéricos)
            const cepLimpo = this.cep.replace(/\D/g, '');
            if (cepLimpo.length !== 8) {
                this.createAlert('danger', 'Atenção!', 'CEP deve conter 8 dígitos.');
                return false;
            }

            // Validação de número (pode ser só não vazio, mas pode adicionar mais regras se quiser)
            if (!this.numero.trim()) {
                this.createAlert('danger', 'Atenção!', 'Número do endereço é obrigatório.');
                return false;
            }
            return true;
        }

        if (this.step === 3) {
            if (this.selectedCompanyTypeIds.length === 0) {
                this.createAlert('danger', 'Atenção!', 'Selecione pelo menos um tipo de empresa.');
                return false;
            }
            return true;
        }

        if (this.step === 4) {
            // Validação de senha: ao menos 6 caracteres, pelo menos uma letra e um número
            const senhaValida = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(this.password);
            if (!senhaValida) {
                this.createAlert(
                    'danger',
                    'Atenção!',
                    'A senha deve ter pelo menos 6 caracteres, incluindo letras e números.'
                );
                return false;
            }
            if (this.password !== this.password2) {
                this.createAlert('danger', 'Atenção!', 'As senhas não coincidem.');
                return false;
            }

            return true;
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

    finalizarCadastro() {
        // Monta o payload da empresa
        const companyPayload = {
            name: this.nomeFantasia,
            cnpj: this.cnpj,
            phone: this.telefone,
            phoneIsWpp: this.isWatsApp,
            email: this.email,
            description: '',
            logoUrl: '', // ajuste se necessário
            typeIds: this.selectedCompanyTypeIds,
            address: {
                street: this.rua,
                number: this.numero,
                neighborhood: this.bairro,
                city: this.cidade,
                state: this.estado,
                zipCode: this.cep,
                complement: '', // ajuste se necessário
                latitude: 0,
                longitude: 0
            }
        };

        this.companiesService.createCompany(companyPayload)
            .subscribe({
                next: (response) => {
                    this.companyId = response.idCompany;
                    this.cadastrarLogin();
                },
                error: () => {
                    this.createAlert('danger', 'Erro!', 'Erro ao cadastrar empresa.');
                }
            });
    }

    cadastrarLogin() {
        if (!this.companyId) {
            this.createAlert('danger', 'Erro!', 'ID da empresa não encontrado.');
            return;
        }

        const loginPayload = {
            cnpj: this.cnpj,
            password: this.password,
        };

        this.loginCompanyService.createLoginCompany(loginPayload)
            .subscribe({
                next: () => {
                    this.createAlert('success', 'Sucesso!', 'Cadastro realizado com sucesso!');
                },
                error: () => {
                    this.createAlert('danger', 'Erro!', 'Erro ao cadastrar login.');
                }
            });
    }
}
export interface IAlert {
    id: number;
    type: string;
    strong?: string;
    message: string;
    icon?: string;
}