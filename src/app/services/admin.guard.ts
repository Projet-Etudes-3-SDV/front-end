import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

interface CachedUserData {
  role: string;
  timestamp: number;
  isValid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private userCache: CachedUserData | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private pendingRequest: Promise<boolean> | null = null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    // Si une requête est déjà en cours, l'attendre
    if (this.pendingRequest) {
      return this.pendingRequest;
    }

    // Vérifier d'abord si l'utilisateur est connecté
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Vérifier le cache
    if (this.userCache && this.isCacheValid()) {
      return this.checkRoleFromCache();
    }

    // Si pas de cache valide, faire l'appel API
    this.pendingRequest = this.fetchAndCacheUser(state.url);
    const result = await this.pendingRequest;
    this.pendingRequest = null;
    
    return result;
  }

  private isCacheValid(): boolean {
    if (!this.userCache) return false;
    const now = Date.now();
    return (now - this.userCache.timestamp) < this.CACHE_DURATION && this.userCache.isValid;
  }

  private checkRoleFromCache(): boolean {
    if (!this.userCache) return false;
    
    const isAdmin = this.userCache.role === 'admin' || this.userCache.role === 'superadmin';
    
    if (!isAdmin) {
      this.router.navigate(['/access-denied']);
      return false;
    }
    
    return true;
  }

  private async fetchAndCacheUser(returnUrl: string): Promise<boolean> {
    try {
      const response = await this.apiService.getMe();
      const user = response.data;
      
      // Mettre en cache les données utilisateur
      this.userCache = {
        role: user.role,
        timestamp: Date.now(),
        isValid: true
      };
      
      const isAdmin = user.role === 'admin' || user.role === 'superadmin';
      
      if (!isAdmin) {
        this.router.navigate(['/access-denied']);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      // Invalider le cache en cas d'erreur
      this.userCache = null;
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl } 
      });
      return false;
    }
  }

  // Méthode publique pour invalider le cache (à appeler lors de la déconnexion)
  public clearCache(): void {
    this.userCache = null;
    this.pendingRequest = null;
  }
}