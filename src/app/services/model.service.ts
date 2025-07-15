import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModelService {
    constructor(private authService: AuthService, private http: HttpClient) { }

    getModelByBrand(idBrand): Observable<any> {
        return this.http.get<any>(environment.backendApiUrl + '/model/' + idBrand);
    }
}