// src/app/auth/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Importe seu AuthService

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();

    // Se houver um token, clona a requisição e adiciona o header Authorization
    if (authToken) {
      // Clona a requisição para não modificar a original (imutabilidade)
      // e adiciona o header Authorization
      const authReq = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${authToken}`)
      });
      return next.handle(authReq); // Prossegue com a requisição modificada
    }

    // Se não houver token, prossegue com a requisição original
    return next.handle(request);
  }
}