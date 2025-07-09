import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent {
  step = 1;
  mensagem = '';

  mensagemErro = false;
  formLogin: FormGroup;
  formToken: FormGroup;
  formNovaSenha: FormGroup;
  contador: number;
data: any;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
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

  startRecovery() {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    const login = this.formLogin.get('login')?.value;

    this.http.post('http://localhost:8082/api/login-company/start-recovery', {
      cnpj: this.isCNPJ(login) ? login : null,
      email: this.isEmail(login) ? login : null
    }, { responseType: 'text' }).subscribe({
      next: () => {
  this.mensagem = 'Código enviado com sucesso!';
    this.mensagemErro = false;
    this.step = 2;
    this.formToken.reset();
  },
  error: err => {
    this.mensagem = err.error?.message || 'Erro ao enviar o código.';
    this.mensagemErro = true;
  }
});
  }

  validateToken() {
    if (this.formToken.invalid) {
      this.formToken.markAllAsTouched();
      return;
    }

    const login = this.formLogin.get('login')?.value;
    const token = this.formToken.get('token')?.value;

    this.http.post<boolean>('http://localhost:8082/api/login-company/validate-token', {
      cnpj: this.isCNPJ(login) ? login : null,
      email: this.isEmail(login) ? login : null,
      token
    }).subscribe({
      next: (valid) => {
        if (valid) {
          this.step = 3;
          this.mensagem = 'Token validado com sucesso.';
          this.mensagemErro = false;
          this.formNovaSenha.reset();
        } else {
          this.mensagem = 'Token inválido.';
          this.mensagemErro = true;
        }
      },
       error: err => {
    this.mensagem = err.error?.message || 'Erro ao enviar o código.';
    this.mensagemErro = true;
  }
    });
  }

resetPassword() {
  const login = this.formLogin.get('login')?.value;
  const senha = this.formNovaSenha.get('novaSenha')?.value;
  const token = this.formToken.get('token')?.value;

  this.http.post('http://localhost:8082/api/login-company/reset-password', {
    login,
    newPassword: senha,
    token
  }, { responseType: 'text' })
  .subscribe({
    next: () => {
      // Só executa se realmente deu certo
      this.mensagem = '';
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
    this.mensagem = err.error?.message || 'Erro ao redefinir senha.';
    this.mensagemErro = true;
  }
  });
}

  getFormByStep(): FormGroup {
    if (this.step === 1) return this.formLogin;
    if (this.step === 2) return this.formToken;
    return this.formNovaSenha;
  }

  onSubmit(): void {
    this.mensagem = '';
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
}