import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
export class TabsPage implements OnInit, OnDestroy {
  isLoggedIn: Observable<boolean | null> | null = null;
  user: any = null;
  isDesktop: boolean = false;
  menuOpen: boolean = false;
  adminRoles: string[] = ['admin', 'superadmin'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private modalController: ModalController,
    private platform: Platform,
    private toastService: ToastService
  ) {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.isDesktop = this.platform.is('desktop');
  }

  async ngOnInit() {
    // Écouter les changements d'état d'authentification
    this.authService.isAuthenticated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (isAuth) => {
        if (isAuth) {
          // Utilisateur connecté, récupérer ses infos
          try {
            const response = await this.apiService.getMe();
            this.user = response.data;
          } catch (error) {
            console.error('Erreur lors de la récupération des infos utilisateur:', error);
            this.user = null;
          }
        } else {
          // Utilisateur déconnecté, vider les données
          this.user = null;
        }
      });

    // Écouter directement les changements d'utilisateur si le service le supporte
    if (this.authService.getCurrentUser) {
      this.authService.getCurrentUser()
        .pipe(takeUntil(this.destroy$))
        .subscribe(user => {
          this.user = user;
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    return this.user && this.adminRoles.includes(this.user?.role);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  
  closeMenu() {
    this.menuOpen = false;
  }

  async openCart() {
    if (this.isLoggedIn) {
      this.isLoggedIn.pipe(takeUntil(this.destroy$)).subscribe(async (loggedIn) => {
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
}