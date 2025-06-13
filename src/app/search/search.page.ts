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

interface SearchFilters {
  available?: boolean;
  minimumPrice?: number;
  maximumPrice?: number;
  isYearlyPrice: boolean;
  category?: string;
  description?: string;
}

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
    ]),
    trigger('slideAnimation', [
      transition(':enter', [
        style({ height: '0', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('300ms ease-in', style({ height: '0', opacity: 0 }))
      ])
    ])
  ]
})
export class SearchPage {
  searchTerm: string = '';
  filter: 'products' | 'categories' = 'products';
  results: any[] = [];
  categories: any[] = [];
  isLoading = false;
  total: number = 0;
  isDesktop: boolean = false;
  showResults = false;
  showFilters = false;

  // Filtres
  filters: SearchFilters = {
    isYearlyPrice: false,
    available: true
  };

  // Débounce timer pour les filtres
  private filterTimeout: any;

  constructor(
    private productSearchService: ProductSearchService,
    private navCtrl: NavController,
    private platform: Platform
  ) {
    this.isDesktop = this.platform.is('desktop');
  }

  async ionViewWillEnter() {
    // Charger les catégories pour le filtre
    await this.loadCategories();
    this.onSearchChange();
  }

  async loadCategories() {
    try {
      // Supposons que vous avez une méthode pour récupérer les catégories
      const { categories } = await this.productSearchService.search(
        { name: '', page: 1, limit: 100 },
        'categories'
      );
      this.categories = categories || [];
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
      this.categories = [];
    }
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  async onSearchChange() {
    this.isLoading = true;
    this.showResults = false;

    try {
      const searchCriteria = this.buildSearchCriteria();

      const { products, categories, total } = await this.productSearchService.search(
        searchCriteria,
        this.filter
      );

      this.results = this.filter === 'products' ? products : categories;
      this.total = total;

      setTimeout(() => this.showResults = true, 10);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      this.results = [];
      this.total = 0;
    } finally {
      this.isLoading = false;
    }
  }

  onFiltersChange() {
    // Débounce pour éviter trop d'appels API
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.filterTimeout = setTimeout(() => {
      this.onSearchChange();
    }, 500);
  }

  buildSearchCriteria(): any {
    const criteria: any = {
      name: this.searchTerm,
      page: 1,
      limit: 50
    };

    if (this.filter === 'products') {
      if (this.filters.available !== undefined) {
        criteria.available = this.filters.available;
      }

      if (this.filters.minimumPrice !== undefined && this.filters.minimumPrice > 0) {
        criteria.minimumPrice = this.filters.minimumPrice;
      }

      if (this.filters.maximumPrice !== undefined && this.filters.maximumPrice > 0) {
        criteria.maximumPrice = this.filters.maximumPrice;
      }

      criteria.isYearlyPrice = this.filters.isYearlyPrice;

      if (this.filters.category) {
        criteria.category = this.filters.category;
      }
    }

    if (this.filters.description && this.filters.description.trim()) {
      criteria.description = this.filters.description.trim();
    }

    return criteria;
  }

  clearFilters() {
    this.filters = {
      isYearlyPrice: false
    };
    this.onSearchChange();
  }

  applyFilters() {
    this.onSearchChange();
    this.showFilters = false;
  }

  get activeFiltersCount(): number {
    let count = 0;

    if (this.filters.available !== undefined) count++;
    if (this.filters.minimumPrice !== undefined && this.filters.minimumPrice > 0) count++;
    if (this.filters.maximumPrice !== undefined && this.filters.maximumPrice > 0) count++;
    if (this.filters.isYearlyPrice) count++;
    if (this.filters.category) count++;
    if (this.filters.description && this.filters.description.trim()) count++;

    return count;
  }

  navigateToProduct(productId: string) {
    this.navCtrl.navigateForward(['/categories/product', productId]);
  }

  navigateToCategory(categoryId: string) {
    this.navCtrl.navigateForward(['/categories/products', categoryId]);
  }
}