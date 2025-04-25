import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ToastController, ModalController, Platform } from '@ionic/angular';

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
    private toastController: ToastController,
    private modalController: ModalController,
    private platform: Platform
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
      this.presentToast('Impossible de charger le panier.', 'danger');
    }
  }

  async removeFromCart(productId: string) {
    try {
      await this.apiService.deleteItemFromCart(productId);
      this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
      this.presentToast('Article supprimé du panier.', 'warning');
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      this.presentToast('Impossible de supprimer le produit.', 'danger');
    }
  }  

  async resetCart() {
    try {
      await this.apiService.resetCart();
      this.cartItems = [];
      this.presentToast('Panier vidé.', 'warning');
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
    }
  }

  async validateCart() {
    try {
      await this.apiService.validateCart();
      this.cartItems = [];
      this.presentToast('Achat validé avec succès ! 🎉', 'success');
    } catch (error: any) {
      if(error.response.data.code === 'ALREADY_SUBSCRIBED') {
        this.presentToast('Vous êtes déjà abonné à ce produit.', 'warning');
        return;
      } else {
        this.presentToast('Impossible de valider l\'achat.', 'danger');
      }
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
      position: 'top',
      swipeGesture: 'vertical'
    });
    toast.present();
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
