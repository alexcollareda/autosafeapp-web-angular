import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlateService {
    constructor(private authService: AuthService, private http: HttpClient) { }

    findPlate(plate: string): Observable<any> {
        return this.http.get<any>(environment.backendApiUrl + '/plate/' + plate)
    }
}