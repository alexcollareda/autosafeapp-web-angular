import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginCompanyService } from 'app/services/login-company.service';

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

    constructor(private http: HttpClient, private router: Router, private authService: AuthService, private loginCompanyService: LoginCompanyService) {}

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
        this.authService.logout();
        const payload = {
            cnpj: this.cnpj,
            password: this.password
        };

        this.loginCompanyService.doLogin(payload).subscribe({
            next: (data) => {
                this.authService.setToken(data.token);
                this.authService.setCompanyName(data.companyName);
                if (this.authService.isAuthenticated()) {
                    this.router.navigate(['/app/dashboard']);
                } else {
                    alert('CNPJ ou senha inválidos!');
                }
            }
        });
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/examples/login']);
    }

}
