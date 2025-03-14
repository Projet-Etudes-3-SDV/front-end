import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  featuredProducts: any[] = [];
  categories: any[] = [];
  specialOffers: any[] = [];
  isDesktop: boolean = false;

  constructor(private apiService: ApiService, private router: Router, private platform: Platform) {}

  ngOnInit() {
    this.loadFeaturedProducts();
    this.loadCategories();
    this.isDesktop = this.platform.is('desktop');
  }

  async loadFeaturedProducts() {
    try {
      const response = await this.apiService.get('/products?featured=true');
      this.featuredProducts = response.data as any[];
    } catch (error) {
      console.error('Erreur lors du chargement des produits phares:', error);
    }
  }

  async loadCategories() {
    try {
      const response = await this.apiService.get('/categories');
      this.categories = response.data as any[];
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  }

  goToCategory(categoryId: string) {
    this.router.navigate(['/categories/products', categoryId]);
  }

  goToProduct(productId: string) {
    this.router.navigate(['/categories/product', productId]);
  }
}
