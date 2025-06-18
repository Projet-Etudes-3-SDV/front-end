import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  standalone: false,
  encapsulation: ViewEncapsulation.None
})
export class AdminLayoutComponent {
  sidebarId = 'sidebar';

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
    },
    {
      name: 'Paramètres',
      url: '/admin/settings',
      icon: 'bi bi-gear'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}