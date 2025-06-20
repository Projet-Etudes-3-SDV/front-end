import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'client' | 'admin' | 'superadmin';
  phone?: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  standalone: false,
  encapsulation: ViewEncapsulation.None
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  sidebarId = 'sidebar';
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  navItems = [
    {
      name: 'Dashboard',
      url: '/admin/dashboard',
      icon: 'bi bi-speedometer2'
    },
    {
      name: 'Utilisateurs',
      url: '/admin/users',
      icon: 'bi bi-people'
    },
    {
      name: 'Catégories',
      url: '/admin/categories',
      icon: 'bi bi-list-ul'
    },
    {
      name: 'Produits',
      url: '/admin/products',
      icon: 'bi bi-box'
    },
    {
      name: 'Commandes',
      url: '/admin/orders',
      icon: 'bi bi-receipt'
    },
    {
      name: 'Landing Pages',
      url: '/admin/landing',
      icon: 'bi bi-layout-text-window'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements de l'utilisateur connecté
    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        
        // Vérifier les permissions
        if (user && !this.hasAdminAccess(user)) {
          console.warn('Utilisateur sans accès admin détecté, redirection...');
          this.router.navigate(['/access-denied']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private hasAdminAccess(user: User): boolean {
    return user.role === 'admin' || user.role === 'superadmin';
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getCurrentPageTitle(): string {
    const url = this.router.url;
    const titles: { [key: string]: string } = {
      '/admin/dashboard': 'Tableau de bord',
      '/admin/users': 'Utilisateurs',
      '/admin/categories': 'Catégories',
      '/admin/products': 'Produits',
      '/admin/orders': 'Commandes',
      '/admin/landing': 'Landing Pages',
    };
    
    return titles[url] || 'Administration';
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'Utilisateur';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  getUserRole(): string {
    if (!this.currentUser) return '';
    
    switch (this.currentUser.role) {
      case 'superadmin':
        return 'Super Administrateur';
      case 'admin':
        return 'Administrateur';
      default:
        return 'Utilisateur';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}