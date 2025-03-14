import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

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

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadFeaturedProducts();
    this.loadCategories();
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
