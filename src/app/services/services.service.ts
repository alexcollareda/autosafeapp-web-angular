import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServicesService {
    constructor(private authService: AuthService, private http: HttpClient) { }

    createService(service: any): Observable<any> {
        return this.http.post<any>(environment.backendApiUrl + '/services', service);
    }

    findByCompanyLogged(): Observable<any> {
        return this.http.get<any>(environment.backendApiUrl + '/services');
    }

    countActiveServices(): Observable<any> {
        return this.http.get<Number>(environment.backendApiUrl + '/services/count/active');
    }

    findByServiceId(serviceId): Observable<any> {
        return this.http.get<any>(environment.backendApiUrl + '/services/company/' + serviceId);
    }
}