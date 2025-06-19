import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { register } from 'swiper/element/bundle';

register();

interface LandingData {
  id: string;
  header: { 
    title: string; 
    subtitle?: string;
  };
  carouselSection: { 
    title: string; 
    description: string; 
    products: Array<{
      product: {
        id: string;
        name: string;
        monthlyPrice: number;
        yearlyPrice: number;
        imageUrl?: string;
        category: any;
        features: any[];
      };
      order: number;
    }>; 
    order: number;
  };
  categorySection: { 
    title: string; 
    description: string; 
    order: number;
    categories: Array<{
      id: string;
      name: string;
      description: string;
      imageUrl?: string;
    }>;
  };
  alert?: { 
    title: string; 
    description?: string; 
    type: "info" | "warning" | "error" | "success"; 
    order: number;
  };
}

interface Section {
  type: 'carousel' | 'category' | 'alert';
  order: number;
  data: any;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  landingData: LandingData | null = null;
  categories: any[] = [];
  isDesktop: boolean = false;
  orderedSections: Section[] = [];

  constructor(
    private apiService: ApiService, 
    private router: Router, 
    private platform: Platform
  ) {}

  ngOnInit() {
    this.loadMainLanding();
    this.loadCategories();
    this.isDesktop = this.platform.is('desktop');
  }

  async loadMainLanding() {
    try {
      const response = await this.apiService.get('/landings/main');
      this.landingData = response.data;
      
      // Les catégories sont déjà incluses dans la réponse
      if (this.landingData?.categorySection?.categories) {
        this.categories = this.landingData.categorySection.categories;
      }
      
      this.buildOrderedSections();
    } catch (error) {
      console.error('Erreur lors du chargement de la landing page principale:', error);
      // Fallback vers les anciennes données si pas de landing page configurée
      this.loadFallbackData();
    }
  }

  async loadFallbackData() {
    try {
      const response = await this.apiService.get('/products?featured=true');
      const featuredProducts = (response.data as { result: any[] }).result;
      
      // Attendre que les catégories soient chargées
      await this.loadCategories();
      
      // Créer une landing page par défaut
      this.landingData = {
        id: 'fallback',
        header: {
          title: 'Bienvenue sur notre boutique',
          subtitle: 'Découvrez nos produits phares et nos meilleures offres !'
        },
        carouselSection: {
          title: 'Produits en vedette',
          description: '',
          products: featuredProducts.map((product: any, index: number) => ({
            product: product,
            order: index + 1
          })),
          order: 1
        },
        categorySection: {
          title: 'Catégories',
          description: '',
          order: 2,
          categories: this.categories
        }
      };
      
      this.buildOrderedSections();
    } catch (error) {
      console.error('Erreur lors du chargement des données de fallback:', error);
    }
  }

  async loadCategories() {
    try {
      const response = await this.apiService.get('/categories');
      this.categories = (response.data as { result: any[] }).result;
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  }

  buildOrderedSections() {
    if (!this.landingData) return;

    this.orderedSections = [];

    // Ajouter l'alerte si elle existe
    if (this.landingData.alert) {
      this.orderedSections.push({
        type: 'alert',
        order: this.landingData.alert.order,
        data: this.landingData.alert
      });
    }

    // Ajouter la section carousel
    if (this.landingData.carouselSection && this.landingData.carouselSection.products.length > 0) {
      // Trier les produits par ordre et extraire les données
      const sortedProducts = this.landingData.carouselSection.products
        .sort((a, b) => a.order - b.order)
        .map(cp => ({
          id: cp.product.id,
          name: cp.product.name,
          monthlyPrice: cp.product.monthlyPrice,
          yearlyPrice: cp.product.yearlyPrice,
          imageUrl: cp.product.imageUrl,
          order: cp.order
        }));

      this.orderedSections.push({
        type: 'carousel',
        order: this.landingData.carouselSection.order,
        data: {
          ...this.landingData.carouselSection,
          products: sortedProducts
        }
      });
    }

    // Ajouter la section catégories
    if (this.landingData.categorySection && this.landingData.categorySection.categories.length > 0) {
      this.orderedSections.push({
        type: 'category',
        order: this.landingData.categorySection.order,
        data: this.landingData.categorySection
      });
    }

    // Trier par ordre
    this.orderedSections.sort((a, b) => a.order - b.order);
  }

  getAlertClass(type: string): string {
    const classes = {
      info: 'alert-primary',
      success: 'alert-success',
      warning: 'alert-warning',
      error: 'alert-danger'
    };
    return classes[type as keyof typeof classes] || 'alert-primary';
  }

  getAlertIcon(type: string): string {
    const icons = {
      info: 'information-circle',
      success: 'checkmark-circle',
      warning: 'warning',
      error: 'close-circle'
    };
    return icons[type as keyof typeof icons] || 'information-circle';
  }

  goToCategory(categoryId: string) {
    this.router.navigate(['/categories/products', categoryId]);
  }

  goToProduct(productId: string) {
    this.router.navigate(['/categories/product', productId]);
  }

  // Getters pour la compatibilité avec l'ancien template
  get featuredProducts() {
    const carouselSection = this.orderedSections.find(s => s.type === 'carousel');
    return carouselSection?.data.products || [];
  }

  get headerTitle() {
    return this.landingData?.header.title || 'Bienvenue sur notre boutique';
  }

  get headerSubtitle() {
    return this.landingData?.header.subtitle || 'Découvrez nos produits phares et nos meilleures offres !';
  }

  get carouselTitle() {
    return this.landingData?.carouselSection?.title || 'Produits en vedette';
  }

  get categoryTitle() {
    return this.landingData?.categorySection?.title || 'Catégories';
  }

  shouldShowCarousel(): boolean {
    return this.orderedSections.some(s => s.type === 'carousel' && s.data.products.length > 0);
  }

  shouldShowCategories(): boolean {
    const categorySection = this.orderedSections.find(s => s.type === 'category');
    return !!(categorySection && categorySection.data.categories && categorySection.data.categories.length > 0);
  }

  shouldShowAlert(): boolean {
    return this.orderedSections.some(s => s.type === 'alert');
  }
}