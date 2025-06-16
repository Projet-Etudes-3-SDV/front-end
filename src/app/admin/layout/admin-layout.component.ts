import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { IconSetService } from '@coreui/icons-angular';
import { cilMenu, cilAccountLogout, cilUser, cilSpeedometer, cilInbox, cilCart, cilSettings } from '@coreui/icons';
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
      iconComponent: { name: 'cil-speedometer' }
    },
    {
      name: 'Utilisateurs',
      url: '/admin/users',
      iconComponent: { name: 'cil-user' }
    },
    {
      name: 'Catégories',
      url: '/admin/categories',
      iconComponent: { name: 'cil-menu' }
    },
    {
      name: 'Produits',
      url: '/admin/products',
      iconComponent: { name: 'cil-inbox' }
    },
    {
      name: 'Commandes',
      url: '/admin/orders',
      iconComponent: { name: 'cil-cart' }
    },
    {
      name: 'Paramètres',
      url: '/admin/settings',
      iconComponent: { name: 'cil-settings' }
    }
  ];

  constructor(
    private iconSetService: IconSetService,
    private authService: AuthService,
    private router: Router
  ) {
    // Enregistrer les icônes CoreUI
    this.iconSetService.icons = { 
      cilMenu, 
      cilAccountLogout, 
      cilUser, 
      cilSpeedometer, 
      cilInbox, 
      cilCart, 
      cilSettings 
    };
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}