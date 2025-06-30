import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    data : Date = new Date();
    focus;
    focus1;
      cnpj: string = '';
  password: string = '';

    constructor(private http: HttpClient, private router: Router) {}

    ngOnInit() {
        var body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');

        var navbar = document.getElementsByTagName('nav')[0];
        navbar.classList.add('navbar-transparent');
    }
    ngOnDestroy(){
        var body = document.getElementsByTagName('body')[0];
        body.classList.remove('login-page');

        var navbar = document.getElementsByTagName('nav')[0];
        navbar.classList.remove('navbar-transparent');
    }

    login() {
    const payload = {
      cnpj: this.cnpj,
      password: this.password
    };

    this.http.post<any>('http://localhost:8082/api/login-company/login', payload)
      .subscribe({
        next: (response) => {
          // Aqui você pode salvar o token ou dados do usuário, se o backend retornar
          // Exemplo: localStorage.setItem('token', response.token);
          // Redireciona para a área logada
           alert('Deu certo!');
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          alert('CNPJ ou senha inválidos!');
        }
      });
  }

}
