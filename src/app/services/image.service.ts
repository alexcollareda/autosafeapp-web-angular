import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImageService {
    constructor(private authService: AuthService, private http: HttpClient) { }

    deleteImageByUrl(logoUrl: string): Observable<any> {
        return this.http.delete<any>(`${environment.backendApiUrl}/public/images/delete-by-url`, { body: { logoUrl } });
    }

  uploadImage(file: File): Observable<string> { 
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${environment.backendApiUrl}/public/images/upload`, formData, { responseType: 'text' });
  }
   
}