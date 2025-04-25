import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, take } from 'rxjs';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { CartPage } from '../cart/cart.page';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
  isLoggedIn: Observable<boolean | null> | null = null;
  isDesktop: boolean = false;

  constructor(
    private authService: AuthService,
    private modalController: ModalController,
    private platform: Platform,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.authService.checkAuthStatus();
    this.isDesktop = this.platform.is('desktop');
  }

  async openCart() {
    this.isLoggedIn?.pipe(take(1)).subscribe(async (loggedIn) => {
      if (!loggedIn) {
        this.presentToast('Vous devez être connecté pour voir le panier.', 'warning');
        return;
      }
  
      const modal = await this.modalController.create({
        component: CartPage,
        cssClass: 'cart-modal'
      });
      await modal.present();
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 4000,
      position: 'top',
      swipeGesture: 'vertical'
    });
    toast.present();
  }
}
