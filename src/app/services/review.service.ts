import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReviewService {
    constructor(private authService: AuthService, private http: HttpClient) { }

    findMyReviews(): Observable<any> {
        return this.http.get<any>(environment.backendApiUrl + '/reviews/companies/my-reviews');
    }
}