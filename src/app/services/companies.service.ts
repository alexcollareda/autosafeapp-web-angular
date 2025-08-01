import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
    constructor(private authService: AuthService, private http: HttpClient) { }

    getCompanyByCNPJ(cnpj: String): Observable<any> { 
        return this.http.get<any>(environment.backendApiUrl + '/public/companies/cnpj/' + cnpj)      
    }

    createCompany(companyPayload: any): Observable<any> {
        return this.http.post<any>(environment.backendApiUrl + '/public/companies', companyPayload)
    }

    getCompanyById(): Observable<any> { 
        return this.http.get<any>(environment.backendApiUrl + '/public/companies/id')      
    }

    updateCompany(companyPayload: any): Observable<any> {
        return this.http.patch<any>(environment.backendApiUrl + '/public/companies/me', companyPayload)
    }

}