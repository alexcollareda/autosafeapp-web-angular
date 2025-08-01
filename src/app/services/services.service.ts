import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServicesService {
    constructor(private authService: AuthService, private http: HttpClient) { }

    createService(service: any): Observable<any> {
        return this.http.post<any>(environment.backendApiUrl + '/public/services', service);
    }

    findByCompanyLogged(): Observable<any> {
        return this.http.get<any>(environment.backendApiUrl + '/public/services');
    }

    countActiveServices(): Observable<any> {
        return this.http.get<Number>(environment.backendApiUrl + '/public/services/count/active');
    }

    findByServiceId(serviceId): Observable<any> {
        return this.http.get<any>(environment.backendApiUrl + '/public/services/company/' + serviceId);
    }

    updateService(serviceId: number, servicePayload: any): Observable<any> {
        return this.http.put<any>(environment.backendApiUrl + '/public/services/edit/' + serviceId, servicePayload);
    }
}