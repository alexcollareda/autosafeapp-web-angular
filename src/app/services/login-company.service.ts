import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoginCompanyService {
    constructor(private authService: AuthService, private http: HttpClient) { }

    doLogin(payload): Observable<any> {
        return this.http.post<any>(environment.backendApiUrl + '/public/login-company/login', payload)
           
    }

    createLoginCompany(loginPayload: any):  Observable<any> {
       return this.http.post<any>(environment.backendApiUrl + '/public/login-company', loginPayload)
       
    }

    startRecoveryPassword(payload): Observable<any> {
        return this.http.post<any>(environment.backendApiUrl + '/public/login-company/start-recovery', payload)
    }

    validateToken(payload): Observable<any> {
        return this.http.post<Boolean>(environment.backendApiUrl + '/public/login-company/validate-token' , payload)
    }

    resetPassword(payload): Observable<any> {
        return this.http.post<any>(environment.backendApiUrl + '/public/login-company/reset-password', payload)
    }
}