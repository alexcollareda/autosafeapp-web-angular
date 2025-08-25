import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type PromotionType = 'PROFILE_REDIRECT' | 'EXTERNAL_LINK' | 'SERVICE_LINK';
export type CtaButtonType = 'SEE_MORE' | 'BOOK_NOW' | 'CONTACT_US';

export interface Promotion {
  id: number;
  title: string;
  description: string;
  promotionType: PromotionType;
  targetUrl?: string | null;
  serviceId?: number | null;
  serviceName?: string | null;
  ctaButtonType: CtaButtonType;
  imageUrl: string;
  imageAspectRatio?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status?: 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'INACTIVE' | string;
  address?: any;
  createdAt?: string;
  updatedAt?: string;
  companyName?: string;
}

@Injectable({ providedIn: 'root' })
export class PromotionsService {
  private API = `${environment.backendApiUrl}/api`;

  constructor(private http: HttpClient) {}

  // >>> novo endpoint
  listMine(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.API}/promotions/company/list`);
  }
}
