import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OperatingHoursService {
    constructor(private authService: AuthService, private http: HttpClient) { }

    putOperatingHours(payload: any): Observable<any> {
        return this.http.put<any>(environment.backendApiUrl + '/operating-hours', payload);
    }

    getOperatingHours(): Observable<any> {
        return this.http.get<any>(environment.backendApiUrl + '/operating-hours');
    }
}