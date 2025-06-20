import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from './api.service';
import { AxiosError, AxiosResponse } from 'axios';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'client' | 'admin' | 'superadmin';
  phone?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<boolean | null>(null);
  private currentUser = new BehaviorSubject<User | null>(null);
  private userFetchPromise: Promise<void> | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const cachedUser = this.getCachedUser();

    if (!token) {
      this.authState.next(false);
      this.currentUser.next(null);
      return;
    }

    // Si on a un utilisateur en cache, l'utiliser immédiatement
    if (cachedUser) {
      this.authState.next(true);
      this.currentUser.next(cachedUser);
      
      // Vérifier en arrière-plan si les données sont toujours valides
      this.checkAuthStatusInBackground();
    } else {
      // Pas de cache, vérifier immédiatement
      await this.checkAuthStatus();
    }
  }

  isAuthenticated(): Observable<boolean | null> {
    return this.authState.asObservable();
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  private getCachedUser(): User | null {
    try {
      const cached = localStorage.getItem('cached_user');
      const timestamp = localStorage.getItem('cached_user_timestamp');
      
      if (!cached || !timestamp) return null;
      
      const cacheAge = Date.now() - parseInt(timestamp);
      const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
      
      if (cacheAge > CACHE_DURATION) {
        this.clearUserCache();
        return null;
      }
      
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  private setCachedUser(user: User): void {
    try {
      localStorage.setItem('cached_user', JSON.stringify(user));
      localStorage.setItem('cached_user_timestamp', Date.now().toString());
    } catch (error) {
      console.warn('Impossible de mettre en cache les données utilisateur:', error);
    }
  }

  private clearUserCache(): void {
    localStorage.removeItem('cached_user');
    localStorage.removeItem('cached_user_timestamp');
  }

  async checkAuthStatus(): Promise<void> {
    // Éviter les appels multiples simultanés
    if (this.userFetchPromise) {
      return this.userFetchPromise;
    }

    const token = localStorage.getItem('auth_token') ?? '';
    if (!token) {
      this.authState.next(false);
      this.currentUser.next(null);
      this.clearUserCache();
      return;
    }

    this.userFetchPromise = this.fetchUserData();
    await this.userFetchPromise;
    this.userFetchPromise = null;
  }

  private async fetchUserData(): Promise<void> {
    try {
      const response: AxiosResponse<User> = await this.apiService.getMe();
      if (response.data && response.data.id) {
        this.authState.next(true);
        this.currentUser.next(response.data);
        this.setCachedUser(response.data);
      } else {
        this.logout();
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Token invalide ou expiré:', axiosError.response?.data || axiosError.message);
      this.logout();
    }
  }

  private async checkAuthStatusInBackground(): Promise<void> {
    try {
      const response: AxiosResponse<User> = await this.apiService.getMe();
      if (response.data && response.data.id) {
        this.currentUser.next(response.data);
        this.setCachedUser(response.data);
      } else {
        this.logout();
      }
    } catch (error) {
      // En cas d'erreur en arrière-plan, on ne fait rien
      // L'utilisateur continue avec les données en cache
      console.warn('Vérification en arrière-plan échouée:', error);
    }
  }

  async login(credentials: { email: string; password: string }): Promise<void> {
    try {
      const response = await this.apiService.post<{ 
        accessToken?: string; 
        userPresenter?: User; 
        code?: string 
      }>('/users/login', credentials);

      if (response.data.code === 'VERIFY_CODE') {
        throw {
          response: {
            status: 200,
            data: { code: 'VERIFY_CODE' }
          }
        };
      }

      const token = response.data.accessToken;
      const user = response.data.userPresenter;

      if (token && user?.id) {
        localStorage.setItem('auth_token', token);
        this.cookieService.set('user_id', user.id, { path: '/' });
        this.authState.next(true);
        this.currentUser.next(user);
        this.setCachedUser(user);
        
        this.redirectBasedOnRole(user.role);
      } else {
        return Promise.reject(new Error('Aucun token reçu'));
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async validateLoginCode(credentials: { email: string; authCode: string }): Promise<void> {
    try {
      const response = await this.apiService.post<{ 
        accessToken: string; 
        userPresenter: User 
      }>('/users/validate-login', credentials);

      const token = response.data.accessToken;
      const user = response.data.userPresenter;

      localStorage.setItem('auth_token', token);
      this.cookieService.set('user_id', user.id, { path: '/' });
      this.authState.next(true);
      this.currentUser.next(user);
      this.setCachedUser(user);
      
      this.redirectBasedOnRole(user.role);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private redirectBasedOnRole(role: string): void {
    switch (role) {
      case 'admin':
      case 'superadmin':
        this.router.navigate(['/account']);
        break;
      case 'client':
      default:
        this.router.navigate(['/account']);
        break;
    }
  }

  isAdmin(): boolean {
    const user = this.currentUser.value;
    return user?.role === 'admin' || user?.role === 'superadmin';
  }

  isSuperAdmin(): boolean {
    const user = this.currentUser.value;
    return user?.role === 'superadmin';
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

  logout(): void {
    localStorage.removeItem('auth_token');
    this.cookieService.delete('user_id', '/');
    this.clearUserCache();
    this.authState.next(false);
    this.currentUser.next(null);
    this.userFetchPromise = null;
    this.router.navigate(['/login']);
  }
}