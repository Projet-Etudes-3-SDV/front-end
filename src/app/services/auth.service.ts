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
      const response: AxiosResponse<{ id: any }> = await this.apiService.getMe();
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
      const response = await this.apiService.post<{ accessToken?: string; userPresenter?: { id: string }; code?: string }>('/users/login', credentials);

      if (response.data.code === 'VERIFY_CODE') {
        throw {
          response: {
            status: 200,
            data: { code: 'VERIFY_CODE' }
          }
        };
      }

      const token = response.data.accessToken;
      const userId = response.data.userPresenter?.id;

      if (token && userId) {
        localStorage.setItem('auth_token', token);
        this.cookieService.set('user_id', userId, { path: '/' });
        this.authState.next(true);
        this.router.navigate(['/account']);
      } else {
        return Promise.reject(new Error('Aucun token reçu'));
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async validateLoginCode(credentials: { email: string; authCode: string }): Promise<void> {
    try {
      const response = await this.apiService.post<{ accessToken: string; userPresenter: { id: string } }>('/users/validate-login', credentials);

      const token = response.data.accessToken;
      const userId = response.data.userPresenter?.id;

      localStorage.setItem('auth_token', token);
      this.cookieService.set('user_id', userId, { path: '/' });
      this.authState.next(true);
      this.router.navigate(['/account']);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await this.apiService.post('/users/forgot-password', { email });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await this.apiService.post('/users/reset-password', {
        token,
        newPassword
      });
    } catch (error) {
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
