import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: false,
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query('ion-card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ProductsPage {
  products: any[] = [];
  categoryId: string = '';
  isDesktop: boolean = false;
  showProducts = false;

  constructor(
    public apiService: ApiService,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.isDesktop = this.platform.is('desktop');
    const categoryId = this.route.snapshot.paramMap.get('categoryId');
    if (categoryId) {
      this.categoryId = categoryId;
    } else {
      console.error('Category ID is null');
    }
  }

  ionViewWillEnter() {
    this.showProducts = false;
    setTimeout(() => {
      if (this.categoryId) {
        this.apiService.getProductsByCategory(this.categoryId).then(response => {
          this.products = response.data.result;
          this.showProducts = true;
        }).catch(error => {
          console.error(error);
        });
      }
    }, 10);
  }

  navigateToProduct(productId: string) {
    this.navCtrl.navigateForward(['/categories/product', productId]);
  }
}
