import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BrandService {
    constructor(private authService: AuthService, private http: HttpClient) { }

    getAllBrands(): Observable<any> {
        return this.http.get<any>(environment.backendApiUrl + '/brand')
           
    }
}