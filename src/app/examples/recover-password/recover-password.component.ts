import { LoginCompanyService } from 'app/services/login-company.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { IAlert } from '../register/register.component';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent {
  public alerts: Array<IAlert> = [];
  step = 1;
  formLogin: FormGroup;
  formToken: FormGroup;
  formNovaSenha: FormGroup;
  contador: number;
  data: any;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private loginCompanyService: LoginCompanyService) {
    this.formLogin = this.fb.group({
      login: ['', Validators.required]
    });

    this.formToken = this.fb.group({
      token: ['', Validators.required]
    });

    this.formNovaSenha = this.fb.group({
      novaSenha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    var body = document.getElementsByTagName('body')[0];
    body.classList.add('login-page');

    var navbar = document.getElementsByTagName('nav')[0];
    navbar.classList.add('navbar-transparent');
  }
  ngOnDestroy() {
    var body = document.getElementsByTagName('body')[0];
    body.classList.remove('login-page');

    var navbar = document.getElementsByTagName('nav')[0];
    navbar.classList.remove('navbar-transparent');
  }

  startRecovery() {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    const login = this.formLogin.get('login')?.value;
    this.loginCompanyService.startRecoveryPassword({
      cnpj: this.isCNPJ(login) ? login : null,
      email: this.isEmail(login) ? login : null
    }).subscribe({
      next: () => {
        this.createAlert('success', '', 'Código enviado com sucesso');
        this.step = 2;
        this.formToken.reset();
      },
      error: err => {
        // Se o erro for 404, significa que o CNPJ ou email não foi encontrado
        if (err.status === 404) {
          this.createAlert('danger', '', 'CNPJ ou email não encontrado.');
        } else {
          this.createAlert('danger', '', 'Erro ao enviar o código.');
        }
      }
    });
  }

  validateToken() {
    if (this.formToken.invalid) {
      this.formToken.markAllAsTouched();
      return;
    }

    this.loginCompanyService.validateToken({
      cnpj: this.formLogin.get('login')?.value,
      token: this.formToken.get('token')?.value
    })
      .subscribe({
        next: (valid) => {
          if (valid) {
            this.step = 3;
            this.createAlert('success', '', 'Token validado com sucesso.');
            this.formNovaSenha.reset();
          } else {
            this.createAlert('danger', '', 'Token inválido.');
          }
        },
        error: err => {
          this.createAlert('danger', '', 'Erro ao enviar o código.');
        }
      });
  }

  resetPassword() {
    const login = this.formLogin.get('login')?.value;
    const senha = this.formNovaSenha.get('novaSenha')?.value;
    const token = this.formToken.get('token')?.value;

    this.loginCompanyService.resetPassword({
      login,
      newPassword: senha,
      token
    }).subscribe({
      next: () => {
        // Só executa se realmente deu certo
        this.step = 4;
        this.formLogin.reset();
        this.formNovaSenha.reset();
        this.formToken.reset();

        // Inicia a contagem só depois do sucesso
        this.contador = 5;
        const interval = setInterval(() => {
          this.contador--;
          if (this.contador === 0) {
            clearInterval(interval);
            this.router.navigate(['/examples/login']);
          }
        }, 1000);
      },
      error: err => {
        this.createAlert('danger', '', 'Erro ao redefinir senha.');
      }
    });

  }

  getFormByStep(): FormGroup {
    if (this.step === 1) return this.formLogin;
    if (this.step === 2) return this.formToken;
    return this.formNovaSenha;
  }

  onSubmit(): void {
    if (this.step === 1) this.startRecovery();
    else if (this.step === 2) this.validateToken();
    else this.resetPassword();
  }

  isEmail(valor: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  }

  isCNPJ(valor: string): boolean {
    return /^\d{14}$/.test(valor.replace(/\D/g, ''));
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