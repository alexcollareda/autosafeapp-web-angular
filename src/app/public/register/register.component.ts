import { LoginCompanyService } from 'app/services/login-company.service';
import { CompanyTypesService } from './../../services/company-types.service';
import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CepService } from 'app/services/cep.service';
import { CompaniesService } from 'app/services/companies.service';
import { isValidCnpj } from '../../utils/cnpj.utils';
import { MetaService } from 'app/services/meta.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    vehicleType: 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'ALL' = 'ALL';
    focus;
    focus1;
    companyId: number | null = null;
    isCnpjExiste = false;
    isEmailExiste = false;
    affiliateCode: string | null = null;

    step: number = 1;
    buttonDescription: string = 'Continuar Cadastro';

    constructor(
        private http: HttpClient,
        private companyTypesService: CompanyTypesService,
        private cepService: CepService,
        private companiesService: CompaniesService,
        private loginCompanyService: LoginCompanyService,
        private metaService: MetaService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        // 1. Tenta pegar o código da URL
        this.route.queryParamMap.subscribe(params => {
            const codeFromUrl = params.get('affiliateCode');

            if (codeFromUrl) {
                // 2. Se achou na URL, SALVA no sessionStorage (e sobrescreve o antigo)
                this.affiliateCode = codeFromUrl;
                sessionStorage.setItem('affiliateCode', codeFromUrl);
                console.log('Affiliate Code Capturado e Salvo (URL):', this.affiliateCode);
            } else {
                // 3. Se NÃO achou na URL, tenta RECUPERAR do sessionStorage
                const codeFromStorage = sessionStorage.getItem('affiliateCode');

                if (codeFromStorage) {
                    this.affiliateCode = codeFromStorage;
                    console.log('Affiliate Code Recuperado (SessionStorage):', this.affiliateCode);
                } else {
                    // Se não tem na URL e nem no storage, o valor será null
                    console.log('Nenhum Affiliate Code encontrado.');
                }
            }
        });

        this.metaService.updatePageMeta({
            title: 'Cadastre sua Empresa - Oficina, Estética Automotiva, Lava-Rápido | Autosafe',
            description: '📈 Cadastre sua oficina, estética automotiva, lava-rápido, lava-jato ou funilaria no Autosafe. Aumente sua clientela e receba mais pedidos. Cadastro gratuito para prestadores!',
            keywords: 'cadastrar oficina app, cadastrar estética automotiva, cadastrar lava rápido, prestador serviços automotivos, parceiro autosafe, aumentar clientes oficina, cadastro gratuito prestadores',
            canonical: 'https://autosafeapp.com.br/public/register',
            ogTitle: 'Seja Parceiro Autosafe - Cadastre sua Empresa Automotiva',
            ogDescription: 'Conecte-se a milhares de proprietários de veículos. Cadastre sua oficina, estética automotiva ou lava-rápido no Autosafe e aumente seus clientes.',
            ogUrl: 'https://autosafeapp.com.br/public/register'
        });
        this.addStructuredData();
        document.body.classList.add('register-page');
        document.getElementsByTagName('nav')[0].classList.add('navbar-transparent');
        this.loadCompanyTypes();
    }

    ngOnDestroy() {
        document.body.classList.remove('register-page');
        document.getElementsByTagName('nav')[0].classList.remove('navbar-transparent');

        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        scripts.forEach(script => {
            if (script.textContent?.includes('Cadastro de Prestadores Automotivos')) {
                script.remove();
            }
        });
    }

    loadCompanyTypes() {
        this.companyTypesService.getAllCompanyTypes().subscribe({
            next: (response) => (this.companyTypes = response)
        });
    }

    toggleCompanyType(id: number) {
        const idx = this.selectedCompanyTypeIds.indexOf(id);
        if (idx > -1) this.selectedCompanyTypeIds.splice(idx, 1);
        else this.selectedCompanyTypeIds.push(id);
    }

    isCompanyTypeSelected(id: number): boolean {
        return this.selectedCompanyTypeIds.includes(id);
    }

    onCnpjBlur() {
        if (this.cnpj === '') {
            return;
        }
        if (this.cnpj && this.cnpj.length === 14 && isValidCnpj(this.cnpj)) {
            this.isCnpjExiste = false;
            this.companiesService.getCompanyByCNPJ(this.cnpj).subscribe({
                next: (data) => {
                    if (data && data.idCompany) {
                        this.createAlert('danger', 'Atenção!', 'Empresa já cadastrada.');
                        this.isCnpjExiste = true;
                        return;
                    }
                },
                error: () => {
                    this.isCnpjExiste = false;
                    this.http
                        .get<any>(`https://open.cnpja.com/office/${this.cnpj}`)
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
        } else {
            this.createAlert('danger', 'Atenção!', 'CNPJ Invalido.');
        }
    }
    onEmailBlur() {
        if (this.email) {
            this.isEmailExiste = false;
            this.companiesService.getCompanyByEmail(this.email).subscribe({
                next: (data) => {
                    if (data && data.idCompany) {
                        this.createAlert('danger', 'Atenção!', 'E-mail já cadastrado.');
                        this.isEmailExiste = true;
                    }
                },
                error: () => {
                    this.isEmailExiste = false;
                }
            });
        }
    }

    buscarCep() {
        if (this.cep) {
            this.cepService.findCep(this.cep).subscribe({
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
            if (this.step === 4) this.buttonDescription = 'Finalizar';
            else if (this.step === 5) this.finalizarCadastro();
            else this.buttonDescription = 'Continuar Cadastro';
        }
    }

    backStep() {
        if (this.step > 1) {
            this.step--;
            this.buttonDescription = this.step === 4 ? 'Finalizar' : 'Continuar Cadastro';
        }
    }

    validateFields() {
        if (this.step === 1) {
            if (!isValidCnpj(this.cnpj)) {
                this.createAlert('danger', 'Atenção!', 'CNPJ inválido.');
                return false;
            }
            if (this.isCnpjExiste) {
                this.createAlert('danger', 'Atenção!', 'CNPJ já cadastrado.');
                return false;
            }
            if (!isValidEmail(this.email)) {
                this.createAlert('danger', 'Atenção!', 'E-mail inválido.');
                return false;
            }
            if (this.isEmailExiste) {
                this.createAlert('danger', 'Atenção!', 'E-mail já cadastrado.');
                return false;
            }
            if (!this.cnpj || !this.razaoSocial || !this.nomeFantasia || !this.telefone || !this.email) {
                this.createAlert('danger', 'Atenção!', 'Preencha todos os campos obrigatórios.');
                return false;
            }
            if (this.cnpj.length !== 14) {
                this.createAlert('danger', 'Atenção!', 'CNPJ inválido.');
                return false;
            }
            const telefoneLimpo = this.telefone.replace(/\D/g, '');
            if (!(telefoneLimpo.length === 10 || telefoneLimpo.length === 11)) {
                this.createAlert('danger', 'Atenção!', 'Telefone inválido.');
                return false;
            }
            return true;
        }

        if (this.step === 2) {
            if (!this.cep || !this.rua || !this.bairro || !this.cidade || !this.estado || !this.numero) {
                this.createAlert('danger', 'Atenção!', 'Preencha todos os campos de endereço.');
                return false;
            }
            const cepLimpo = this.cep.replace(/\D/g, '');
            if (cepLimpo.length !== 8) {
                this.createAlert('danger', 'Atenção!', 'CEP deve conter 8 dígitos.');
                return false;
            }
            return true;
        }

        if (this.step === 3) {
            if (this.selectedCompanyTypeIds.length === 0) {
                this.createAlert('danger', 'Atenção!', 'Selecione pelo menos um tipo de empresa.');
                return false;
            }
            if (!this.vehicleType) {
                this.createAlert('danger', 'Atenção!', 'Selecione o tipo de veículo atendido.');
                return false;
            }
            return true;
        }

        if (this.step === 4) {
            // Validação de senha: ao menos 6 caracteres, pelo menos uma letra e um número
            const senhaValida = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?~]{6,}$/.test(this.password);
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
        let icon = type === 'success' ? 'ui-2_like' : type === 'danger' ? 'objects_support-17' : '';
        const newAlert: IAlert = { id: this.alerts.length + 1, type, strong, message, icon };
        this.alerts.push(newAlert);
        setTimeout(() => this.closeAlert(newAlert), 6000);
    }

    public closeAlert(alert: IAlert) {
        const index = this.alerts.indexOf(alert);
        if (index >= 0) this.alerts.splice(index, 1);
    }

    finalizarCadastro() {
        const companyPayload = {
            name: this.nomeFantasia,
            cnpj: this.cnpj,
            phone: this.telefone,
            cellphone: this.celular,
            phoneIsWpp: this.isWatsApp,
            email: this.email,
            description: '',
            logoUrl: '',
            typeIds: this.selectedCompanyTypeIds,
            vehicleType: this.vehicleType,
            address: {
                street: this.rua,
                number: this.numero,
                neighborhood: this.bairro,
                city: this.cidade,
                state: this.estado,
                zipCode: this.cep,
                complement: '',
                latitude: 0,
                longitude: 0
            },
            affiliateCode: this.affiliateCode
        };

        this.companiesService.createCompany(companyPayload).subscribe({
            next: (response) => {
                this.companyId = response.idCompany;
                this.cadastrarLogin();
            },
            error: () => this.createAlert('danger', 'Erro!', 'Erro ao cadastrar empresa.')
        });
    }

    cadastrarLogin() {
        if (!this.companyId) {
            this.createAlert('danger', 'Erro!', 'ID da empresa não encontrado.');
            return;
        }
        const loginPayload = { cnpj: this.cnpj, password: this.password, companyId: this.companyId };
        this.loginCompanyService.createLoginCompany(loginPayload).subscribe({
            next: () => this.createAlert('success', 'Sucesso!', 'Cadastro realizado com sucesso!'),
            error: () => this.createAlert('danger', 'Erro!', 'Erro ao cadastrar login.')
        });
    }

    private addStructuredData() {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Cadastro de Empresas Automotivas - Autosafe",
            "description": "Cadastre sua empresa do setor automotivo: oficinas mecânicas, estética automotiva, lava-rápido, jato, funilaria",
            "url": "https://autosafeapp.com.br/public/register",
            "inLanguage": "pt-BR",
            "isPartOf": {
                "@type": "WebSite",
                "name": "Autosafe App",
                "url": "https://autosafeapp.com.br/"
            },
            "mainEntity": {
                "@type": "Service",
                "name": "Cadastro de Prestadores Automotivos",
                "description": "Plataforma para cadastro de empresas do setor automotivo",
                "provider": {
                    "@type": "Organization",
                    "name": "Autosafe App",
                    "url": "https://autosafeapp.com.br/"
                },
                "serviceType": [
                    "Cadastro de Oficinas Mecânicas",
                    "Cadastro de Estética Automotiva",
                    "Cadastro de Lava-Rápido",
                    "Cadastro de Lava Jato",
                    "Cadastro de Funilaria",
                    "Cadastro de Guincho"
                ],
                "areaServed": "BR",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "BRL",
                    "description": "Cadastro gratuito para prestadores de serviços automotivos"
                }
            },
            "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://autosafeapp.com.br/"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Cadastro de Parceiros",
                        "item": "https://autosafeapp.com.br/public/register"
                    }
                ]
            }
        };
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }
}

export interface IAlert {
    id: number;
    type: string;
    strong?: string;
    message: string;
    icon?: string;
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
