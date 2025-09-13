// src/app/auth/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse // Importe HttpErrorResponse para detectar erros
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; // Importe throwError
import { catchError } from 'rxjs/operators'; // Importe catchError para tratamento de erros
import { AuthService } from './auth.service'; // Importe seu AuthService
import { Router } from '@angular/router'; // Importe Router para redirecionamento

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router // Injete o Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();

    let authReq = request; // Inicializa com a requisição original

    // Se houver um token, clona a requisição e adiciona o header Authorization
    if (authToken) {
      authReq = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${authToken}`)
      });
    }

    // Prossegue com a requisição (original ou modificada) e adiciona o tratamento de erro
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Verifica se o erro é 401 (Não Autorizado) ou 403 (Proibido)
        if (error.status === 401 || error.status === 403) {
          if (!request.url.includes('/public/login-company/login')) {
            console.warn('Sessão expirada ou acesso não autorizado. Redirecionando para a tela de login.');
            this.authService.logout();
            this.router.navigate(['/public/login']);
          }
        }
        return throwError(error);
      })
    );
  }
}