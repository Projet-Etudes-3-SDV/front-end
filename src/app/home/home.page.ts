import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { register } from 'swiper/element/bundle';

// Enregistrer Swiper
register();

interface LandingData {
  id: string;
  header: {
    title: string;
    subtitle?: string;
  };
  carouselSection?: {
    title: string;
    description: string;
    products: Array<{
      product: {
        id: string;
        name: string;
        monthlyPrice: number;
        yearlyPrice: number;
        imageUrl?: string;
        category?: any;
        features?: any[];
      };
      order: number;
    }>;
    order: number;
  };
  categorySection?: {
    title: string;
    description: string;
    order: number;
    categories: Array<{
      category?: {
        id: string;
        name: string;
        description: string;
        imageUrl?: string;
      };
      // Compatibilité avec l'ancienne structure
      id?: string;
      name?: string;
      description?: string;
      imageUrl?: string;
      order?: number;
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

interface TrustLogo {
  name: string;
  url: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, OnDestroy {

  // Data properties
  landingData: LandingData | null = null;
  categories: any[] = [];
  isDesktop: boolean = false;
  orderedSections: Section[] = [];

  // UI State (navbar scrolled supprimé)
  isLoading = true;

  // Trust logos (remplacez par vos vrais logos d'entreprises)
  trustLogos: TrustLogo[] = [
    { name: 'Company 1', url: 'assets/images/cyna-long.svg' },
    { name: 'Company 2', url: 'assets/images/cyna-long.svg' },
    { name: 'Company 3', url: 'assets/images/cyna-long.svg' },
    { name: 'Company 4', url: 'assets/images/cyna-long.svg' },
    { name: 'Company 5', url: 'assets/images/cyna-long.svg' },
  ];

  constructor(
    public apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private platform: Platform
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isDesktop = this.platform.is('desktop');
  }

  async ngOnInit() {
    this.isDesktop = this.platform.is('desktop');

    // Charger les données
    await this.loadMainLanding();

    this.isLoading = false;
  }

  async loadMainLanding() {
    try {
      const response = await this.apiService.get('/landings/main');
      this.landingData = response.data;

      if (this.landingData?.categorySection?.categories) {
        // Adapter la structure des catégories selon le format retourné
        this.categories = this.landingData.categorySection.categories.map(categoryWrapper => {
          // Nouvelle structure avec wrapper
          if (categoryWrapper.category) {
            return {
              id: categoryWrapper.category.id,
              name: categoryWrapper.category.name,
              description: categoryWrapper.category.description,
              imageUrl: categoryWrapper.category.imageUrl
            };
          }
          // Ancienne structure directe (compatibilité)
          return categoryWrapper;
        });
      }

      this.buildOrderedSections();
    } catch (error) {
      console.error('Erreur lors du chargement de la landing page principale:', error);
      await this.loadFallbackData();
    }
  }

  async loadFallbackData() {
    try {
      // Charger les produits en vedette et les catégories
      const [productsResponse, categoriesResponse] = await Promise.all([
        this.apiService.get('/products?featured=true'),
        this.apiService.get('/categories')
      ]);

      const featuredProducts = this.extractDataArray(productsResponse);
      this.categories = this.extractDataArray(categoriesResponse);

      // Filtrer les catégories valides
      const validCategories = this.categories.filter(category =>
        category && category.id && category.name && category.description
      );

      // Créer une landing page par défaut
      this.landingData = {
        id: 'fallback',
        header: {
          title: 'Bienvenue sur notre boutique',
          subtitle: 'Découvrez nos produits phares et nos meilleures offres !'
        },
        carouselSection: {
          title: 'Nos Solutions de Sécurité',
          description: 'Découvrez notre gamme complète de solutions de cybersécurité',
          products: featuredProducts
            .filter(product => product && product.id && product.name) // Filtrer les produits valides
            .map((product: any, index: number) => ({
              product: {
                ...product,
                name: product.name || 'Produit sans nom',
                monthlyPrice: product.monthlyPrice || 0,
                yearlyPrice: product.yearlyPrice || 0
              },
              order: index + 1
            })),
          order: 1
        },
        categorySection: {
          title: 'Nos Expertises en Cybersécurité',
          description: 'Choisissez la solution qui correspond à vos besoins',
          order: 2,
          // Pour le fallback, on garde la structure simple car on récupère directement les catégories
          categories: validCategories
        }
      };

      this.buildOrderedSections();
    } catch (error) {
      console.error('Erreur lors du chargement des données de fallback:', error);
      // Si même le fallback échoue, créer des données minimales
      this.createMinimalFallback();
    }
  }

  private createMinimalFallback() {
    this.landingData = {
      id: 'minimal',
      header: {
        title: 'Bienvenue sur notre boutique',
        subtitle: 'Découvrez nos produits phares et nos meilleures offres !'
      }
    };
    this.orderedSections = [];
  }

  private extractDataArray(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (response?.data?.result && Array.isArray(response.data.result)) {
      return response.data.result;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
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
    if (this.landingData.carouselSection && this.landingData.carouselSection.products && this.landingData.carouselSection.products.length > 0) {
      const sortedProducts = this.landingData.carouselSection.products
        .filter(cp => cp && cp.product) // Filtrer les produits valides
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(cp => ({
          id: cp.product.id,
          name: cp.product.name || 'Produit sans nom',
          monthlyPrice: cp.product.monthlyPrice || 0,
          yearlyPrice: cp.product.yearlyPrice || 0,
          imageUrl: cp.product.imageUrl,
          category: cp.product.category,
          features: cp.product.features || [],
          order: cp.order || 0
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

    // Ajouter la section catégories - CORRECTION ICI
    if (this.landingData.categorySection && this.landingData.categorySection.categories && this.landingData.categorySection.categories.length > 0) {
      // Adapter la nouvelle structure avec l'objet category wrappé
      const validCategories = this.landingData.categorySection.categories
        .filter(categoryWrapper => {
          // Nouvelle structure avec wrapper
          if (categoryWrapper.category) {
            return categoryWrapper.category.id && categoryWrapper.category.name;
          }
          // Ancienne structure directe (compatibilité)
          return categoryWrapper.id && categoryWrapper.name;
        })
        .map(categoryWrapper => {
          // Nouvelle structure avec wrapper
          if (categoryWrapper.category) {
            return {
              id: categoryWrapper.category.id,
              name: categoryWrapper.category.name,
              description: categoryWrapper.category.description,
              imageUrl: categoryWrapper.category.imageUrl,
              order: categoryWrapper.order || 1
            };
          }
          // Ancienne structure directe (compatibilité)
          return {
            id: categoryWrapper.id,
            name: categoryWrapper.name,
            description: categoryWrapper.description,
            imageUrl: categoryWrapper.imageUrl,
            order: categoryWrapper.order || 1
          };
        });

      if (validCategories.length > 0) {
        this.orderedSections.push({
          type: 'category',
          order: this.landingData.categorySection.order,
          data: {
            ...this.landingData.categorySection,
            categories: validCategories
          }
        });
      }
    }

    // Trier par ordre
    this.orderedSections.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // Navigation methods
  goToCategory(categoryId: string) {
    this.router.navigate(['/categories/products', categoryId]);
  }

  goToProduct(productId: string) {
    this.router.navigate(['/categories/product', productId]);
  }

  // Action methods
  async startTrial() {
    this.router.navigate(['/categories']);
  }

  contactSales() {
    this.router.navigate(['/contact'], {
      queryParams: { type: 'sales' }
    });
  }

  watchDemo() {
    // Implémenter la logique pour regarder la démo
    console.log('Watch demo clicked');
  }

  // Scroll methods
  scrollToProducts() {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  scrollToContent() {
    const element = document.getElementById('products') || document.querySelector('.alert-section, .products-section');
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // Utility methods
  getAlertClass(type: string): string {
    const classes = {
      info: 'alert-info',
      success: 'alert-success',
      warning: 'alert-warning',
      error: 'alert-error'
    };
    return classes[type as keyof typeof classes] || 'alert-info';
  }

  getAlertIcon(type: string): string {
    const icons = {
      info: 'information-circle-outline',
      success: 'checkmark-circle-outline',
      warning: 'warning-outline',
      error: 'close-circle-outline'
    };
    return icons[type as keyof typeof icons] || 'information-circle-outline';
  }

  getCategoryInitials(name: string): string {
    if (!name || typeof name !== 'string') {
      return '??'; // Valeur par défaut si le nom est undefined/null
    }

    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getYearlySavings(product: any): number {
    if (!product || !product.monthlyPrice || !product.yearlyPrice) return 0;
    const monthlyCost = product.monthlyPrice * 12;
    const savings = monthlyCost - product.yearlyPrice;
    if (savings <= 0) return 0;
    return Math.round((savings / monthlyCost) * 100);
  }

  formatCurrency(amount: number): string {
    if (!amount || isNaN(amount)) amount = 0;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Getters pour la compatibilité avec le template
  get alertSection() {
    return this.orderedSections.find(s => s.type === 'alert')?.data;
  }

  get carouselSection() {
    return this.orderedSections.find(s => s.type === 'carousel')?.data;
  }

  get categorySection() {
    return this.orderedSections.find(s => s.type === 'category')?.data;
  }

  get headerTitle() {
    return this.landingData?.header.title || 'Bienvenue sur notre boutique';
  }

  get headerSubtitle() {
    return this.landingData?.header.subtitle || 'Découvrez nos produits phares et nos meilleures offres !';
  }

  // Methods pour gérer les interactions utilisateur
  async addToCart(product: any, plan: 'monthly' | 'yearly' = 'monthly') {
    try {
      // Simuler l'ajout au panier (remplacer par votre logique)
      const cartItems = JSON.parse(localStorage.getItem('cart_items') || '[]');
      const newItem = {
        productId: product.id,
        name: product.name,
        price: plan === 'monthly' ? product.monthlyPrice : product.yearlyPrice,
        plan: plan,
        quantity: 1
      };

      cartItems.push(newItem);
      localStorage.setItem('cart_items', JSON.stringify(cartItems));
      localStorage.setItem('cart_count', cartItems.length.toString());

      this.showToast('Produit ajouté au panier', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      this.showToast('Erreur lors de l\'ajout au panier', 'error');
    }
  }

  private async showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    // Implémenter une notification toast simple
    console.log(`${type.toUpperCase()}: ${message}`);

    // Vous pouvez remplacer par Ionic Toast
    // const toast = await this.toastController.create({
    //   message: message,
    //   duration: 2000,
    //   color: type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'
    // });
    // toast.present();
  }

  // Methods pour l'optimisation des performances
  trackByProductId(index: number, product: any): string {
    return product.id;
  }

  trackByCategoryId(index: number, category: any): string {
    return category.id;
  }

  trackBySectionType(index: number, section: Section): string {
    return `${section.type}-${section.order}`;
  }

  // Methods pour la gestion des erreurs d'images
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/placeholder-image.png';
    }
  }

  // Methods pour l'analytics
  trackEvent(eventName: string, properties?: any) {
    // Implémenter le tracking d'événements
    console.log('Track Event:', eventName, properties);
  }

  // Cleanup
  ngOnDestroy() {
    // Nettoyer les observables et les event listeners si nécessaire
  }
}