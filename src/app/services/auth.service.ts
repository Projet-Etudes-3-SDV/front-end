import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from './api.service';
import { AxiosError, AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<boolean | null>(null);
  
    constructor(
      private apiService: ApiService,
      private router: Router,
      private cookieService: CookieService
    ) {
      this.checkAuthStatus();
    }
  
    isAuthenticated() {
      return this.authState.asObservable();
    }
  
    async checkAuthStatus() {
      const token = localStorage.getItem('auth_token') ?? '';
      if (!token) {
        this.authState.next(false);
        return;
      }
  
      try {
        const response: AxiosResponse<{ id: any }> = await this.apiService.get<{ id: any }>('users/me');
        if (response.data.id) {
          this.authState.next(true);
        } else {
          this.logout();
        }
      } catch (error: unknown) {
        const axiosError = error as AxiosError;
        console.error('Token invalide ou expiré:', axiosError.response?.data || axiosError.message);
        this.logout();
      }
    }
  
    async login(credentials: { email: string; password: string }): Promise<void> {
      try {
        const response = await this.apiService.post<{ accessToken: string; userPresenter: { id: string } }>('/users/login', credentials);
        const token = response.data.accessToken;
        const userId = response.data.userPresenter.id;
    
        if (token && userId) {
          localStorage.setItem('auth_token', token);
          console.log(localStorage.getItem('auth_token'));
          this.cookieService.set('user_id', userId, { path: '/' });
          this.authState.next(true);
          this.router.navigate(['/account']);
          return Promise.resolve();
        } else {
          return Promise.reject(new Error('Aucun token reçu'));
        }
      } catch (error: unknown) {
        return Promise.reject(error);
      }
    } 
  
    logout() {
      localStorage.removeItem('auth_token');
      this.cookieService.delete('user_id', '/');
      this.authState.next(false);
      this.router.navigate(['/login']);
    }
  }
