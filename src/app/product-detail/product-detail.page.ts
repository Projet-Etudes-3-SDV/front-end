import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastController, Platform } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: false
})
export class ProductDetailPage implements OnInit {
  product: any;
  productId: string = '';
  userId: string = '';
  isDesktop: boolean = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private cookieService: CookieService,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.userId = this.cookieService.get('user_id');
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.productId = productId;
      this.apiService.getProductById(this.productId).then(response => {
        this.product = response.data;
      }).catch(error => {
        console.error(error);
      });
    } else {
      console.error('Product ID is null');
    }
    this.isDesktop = this.platform.is('desktop');
  }

  async addToCart(plan: 'monthly' | 'yearly') {
    if (!this.userId) {
      this.presentToast('Vous devez être connecté pour ajouter au panier.', 'warning');
      return;
    }

    try {
      await this.apiService.addItemToCart(this.productId, plan);
      this.presentToast(`Produit ajouté au panier (${plan === 'monthly' ? 'Mensuel' : 'Annuel'}) !`, 'success');
    } catch (error: any) {
      if(error.response.data.message === 'User is already subbed to this product') {
        this.presentToast('Vous avez déjà ajouté ce produit à votre panier.', 'warning');
      } else {
        console.error('Erreur lors de l\'ajout au panier:', error);
        this.presentToast('Erreur lors de l\'ajout au panier.', 'danger');
      }
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
}
