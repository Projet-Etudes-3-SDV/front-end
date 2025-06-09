import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Platform } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';
import { take } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: false,
  animations: [
    trigger('fadeInCard', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProductDetailPage {
  product: any;
  productId: string = '';
  userId: string = '';
  isDesktop: boolean = false;
  showProduct = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private platform: Platform,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.userId = this.cookieService.get('user_id');
    this.isDesktop = this.platform.is('desktop');
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.productId = productId;
    } else {
      console.error('Product ID is null');
    }
  }

  ionViewWillEnter() {
    this.showProduct = false;
    setTimeout(() => {
      this.apiService.getProductById(this.productId).then(response => {
        this.product = response.data;
        this.showProduct = true;
      }).catch(error => {
        console.error(error);
      });
    }, 10);
  }

  async addToCart(plan: 'monthly' | 'yearly') {
    this.authService.isAuthenticated().pipe(take(1)).subscribe(async (loggedIn) => {
      if (!loggedIn) {
        this.toastService.presentToast('Vous devez être connecté pour ajouter au panier.', 'warning');
        return;
      }

      try {
        await this.apiService.addItemToCart(this.productId, plan);
        this.toastService.presentToast(`Produit ajouté au panier (${plan === 'monthly' ? 'Mensuel' : 'Annuel'}) !`, 'success');
      } catch (error: any) {
        if (error.response?.data?.code === 'ALREADY_SUBSCRIBED') {
          this.toastService.presentToast('Vous êtes déjà abonné à ce produit.', 'warning');
        } else if (error.response?.data?.code === 'CART_ITEM_EXISTS') {
          this.toastService.presentToast('Produit déjà dans le panier.', 'warning');
        } else {
          console.error('Erreur lors de l\'ajout au panier:', error);
          this.toastService.presentToast('Erreur lors de l\'ajout au panier.', 'danger');
        }
      }
    });
  }
}
