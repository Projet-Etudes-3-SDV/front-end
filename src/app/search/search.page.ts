import { Component } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { ProductSearchService } from '../services/product-search.service';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: false,
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query('ion-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class SearchPage {
  searchTerm: string = '';
  filter: 'products' | 'categories' = 'products';
  results: any[] = [];
  isLoading = false;
  total: number = 0;
  isDesktop: boolean = false;
  showResults = false;

  constructor(
    private productSearchService: ProductSearchService,
    private navCtrl: NavController,
    private platform: Platform
  ) {
    this.isDesktop = this.platform.is('desktop');
  }

  ionViewWillEnter() {
    this.onSearchChange();
  }

  async onSearchChange() {
    this.isLoading = true;
    this.showResults = false;

    try {
      const { products, categories, total } = await this.productSearchService.search(
        {
          name: this.searchTerm,
          page: 1,
          limit: 10
        },
        this.filter
      );

      this.results = this.filter === 'products' ? products : categories;
      this.total = total;

      setTimeout(() => this.showResults = true, 10);
    } catch (err) {
      this.results = [];
      this.total = 0;
    } finally {
      this.isLoading = false;
    }
  }

  navigateToProduct(productId: string) {
    this.navCtrl.navigateForward(['/categories/product', productId]);
  }

  navigateToCategory(categoryId: string) {
    this.navCtrl.navigateForward(['/categories/products', categoryId]);
  }
}
