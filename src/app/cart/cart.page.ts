import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ModalController, Platform } from '@ionic/angular';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
})
export class CartPage implements OnInit {
  cartItems: any[] = [];
  token: string = '';
  isDesktop: boolean = false;

  constructor(
    private apiService: ApiService,
    private modalController: ModalController,
    private platform: Platform,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.getCart();
    this.isDesktop = this.platform.is('desktop');
  }

  async getCart() {
    try {
      const response = await this.apiService.get<{ products: any[] }>('/cart/me');
      this.cartItems = response.data.products;
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      this.toastService.presentToast('Impossible de charger le panier.', 'danger');
    }
  }

  async removeFromCart(productId: string) {
    try {
      await this.apiService.deleteItemFromCart(productId);
      this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
      this.toastService.presentToast('Article supprimé du panier.', 'success');
    } catch (error: any) {
      if(error.response?.data?.code === 'CART_BUSY') {
        this.toastService.presentToast('Vous ne pouvez pas supprimer cet article pendant le paiement.', 'danger');
        return;
      }
      console.error('Erreur lors de la suppression du produit:', error);
      this.toastService.presentToast('Impossible de supprimer le produit.', 'danger');
    }
  }  

  async resetCart() {
    try {
      await this.apiService.resetCart();
      this.cartItems = [];
      this.toastService.presentToast('Panier vidé.', 'success');
    } catch (error: any) {
      if (error.response?.data?.code === 'CART_BUSY') {
        this.toastService.presentToast('Vous ne pouvez pas vider le panier pendant le paiement.', 'danger');
        return;
      }
      console.error('Erreur lors de la suppression du panier:', error);
      this.toastService.presentToast('Impossible de vider le panier.', 'danger');
    }
  }

  async checkoutCart() {
    try {
      const response = await this.apiService.checkoutPayment();
      const stripeUrl = response.data.url;
  
      if (stripeUrl) {
        window.location.href = stripeUrl;
      } else {
        this.toastService.presentToast('Lien de paiement invalide.', 'danger');
      }
    } catch (error: any) {
      if (error.response?.data?.code === 'ALREADY_SUBSCRIBED') {
        this.toastService.presentToast('Vous êtes déjà abonné à ce produit.', 'warning');
      } else {
        console.error('Erreur lors du paiement:', error);
        this.toastService.presentToast('Erreur lors du paiement.', 'danger');
      }
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
