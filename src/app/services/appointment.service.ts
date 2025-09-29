import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
    constructor(private authService: AuthService, private http: HttpClient) { }

    createAppointment(appointmentPayload: any): Observable<any> {
        return this.http.post<any>(environment.backendApiUrl + '/api/appointments', appointmentPayload)
    }

        getAppointment(): Observable<any> {
        return this.http.get<any>(environment.backendApiUrl + '/api/appointments/company')
    }

    cancelAppointment(idAppointment: any, playloadCancel:any){
        return this.http.put<any>(environment.backendApiUrl + '/api/appointments/'+idAppointment+'/cancel/company',playloadCancel)
    }

}