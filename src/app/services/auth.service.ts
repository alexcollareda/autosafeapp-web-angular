import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private tokenKey = 'token';
    private companyNameKey = 'companyName';

    setToken(token: string) {
        localStorage.setItem(this.tokenKey, token);
    }

    setCompanyName(companyName: string) {
        localStorage.setItem(this.companyNameKey, companyName);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    getCompanyName(): string | null {
        return localStorage.getItem(this.companyNameKey);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.companyNameKey);
    }
}