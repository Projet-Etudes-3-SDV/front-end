import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { Observable, take } from 'rxjs';
import { ModalController, Platform } from '@ionic/angular';
import { CartPage } from '../cart/cart.page';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false,
  animations: [
    trigger('slideMenu', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class TabsPage implements OnInit {
  isLoggedIn: Observable<boolean | null> | null = null;
  user: any = null;
  isDesktop: boolean = false;
  menuOpen: boolean = false;
  adminRoles: string[] = ['admin', 'superadmin'];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private modalController: ModalController,
    private platform: Platform,
    private toastService: ToastService
  ) {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.authService.checkAuthStatus();
    this.isDesktop = this.platform.is('desktop');
  }

  async ngOnInit() {
    const response = await this.apiService.getMe();
    this.user = response.data;
  }

  onTabChange() {
    setTimeout(() => {
      const contents = document.querySelectorAll('ion-content');
      contents.forEach(content => {
        if ('scrollToTop' in content) {
          (content as any).scrollToTop(0);
        }
      });
    }, 50);
  }

  isAdmin(): boolean {
    return this.adminRoles.includes(this.user?.role);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  
  closeMenu() {
    this.menuOpen = false;
  }

  async openCart() {
    this.isLoggedIn?.pipe(take(1)).subscribe(async (loggedIn) => {
      if (!loggedIn) {
        this.toastService.presentToast('Vous devez être connecté pour voir le panier.', 'warning');
        return;
      }
  
      const modal = await this.modalController.create({
        component: CartPage,
        cssClass: 'cart-modal'
      });
      await modal.present();
    });
  }
}
