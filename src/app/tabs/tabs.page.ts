import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

import { ModalController, Platform } from '@ionic/angular';
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

  constructor(private authService: AuthService, private modalController: ModalController, private platform: Platform) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.authService.checkAuthStatus();
    this.isDesktop = this.platform.is('desktop');
  }

  async openCart() {
    const modal = await this.modalController.create({
      component: CartPage,
      cssClass: 'cart-modal'
    });
    return await modal.present();
  }
}
