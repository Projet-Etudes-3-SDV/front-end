import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ILanding, LandingTableData, LandingFormData, ICarouselProductPopulated, ILandingRequest, ICarouselProductRequest, ICategorySelection, DisplayProduct, ICategory } from './landing.types';

interface Product {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  imageUrl?: string;
  available: boolean;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: false
})
export class LandingPage implements OnInit {
  // Données
  landings: LandingTableData[] = [];
  filteredLandings: LandingTableData[] = [];
  mainLanding: ILanding | null = null;
  availableProducts: Product[] = [];
  availableCategories: ICategory[] = [];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Tri
  sortColumn = 'updatedAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // États
  isLoading = true;
  isSaving = false;
  showEditModal = false;
  showPreviewModal = false;

  // Données modales
  currentLanding: ILanding | null = null;
  previewData: any = null;

  // Formulaire d'édition
  editForm: LandingFormData = {
    header: {
      title: '',
      subtitle: ''
    },
    carouselSection: {
      enabled: false,
      title: 'Produits en vedette',
      description: '',
      order: 1,
      selectedProducts: []
    },
    categorySection: {
      enabled: false,
      title: 'Catégories',
      description: '',
      order: 2,
      selectedCategories: []
    },
    alert: {
      enabled: false,
      title: '',
      description: '',
      type: 'info',
      order: 0
    },
    isMain: false
  };

  constructor(public apiService: ApiService) {}

  ngOnInit(): void {
    this.loadLandings();
    this.loadMainLanding();
    this.loadProducts();
    this.loadCategories();
  }

  async loadLandings(): Promise<void> {
    try {
      this.isLoading = true;
      const response = await this.apiService.get('/landings');
      
      // Pour axios, utiliser response.data
      const landingsData = this.extractDataArray(response.data);
      this.totalItems = landingsData.length;

      this.landings = landingsData.map(landing => ({
        ...landing,
        selected: false
      }));

      this.applyFiltersAndSort();

    } catch (error) {
      console.error('Erreur lors du chargement des landing pages:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadMainLanding(): Promise<void> {
    try {
      const response = await this.apiService.get('/landings/main');
      // Pour axios, utiliser response.data
      this.mainLanding = response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de la landing page principale:', error);
      this.mainLanding = null;
    }
  }

  async loadProducts(): Promise<void> {
    try {
      const response = await this.apiService.get('/products');
      // Pour axios, utiliser response.data
      this.availableProducts = this.extractDataArray(response.data).filter(p => p.available);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  }

  async loadCategories(): Promise<void> {
    try {
      const response = await this.apiService.get('/categories');
      // Pour axios, utiliser response.data
      this.availableCategories = this.extractDataArray(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  }

  private extractDataArray(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && response.result && Array.isArray(response.result)) {
      return response.result;
    }
    if (response && response.data && response.data.result && Array.isArray(response.data.result)) {
      return response.data.result;
    }
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.landings];

    // Tri
    filtered.sort((a, b) => {
      let aValue: any = a;
      let bValue: any = b;

      // Navigation dans les propriétés imbriquées
      const keys = this.sortColumn.split('.');
      keys.forEach(key => {
        aValue = aValue?.[key];
        bValue = bValue?.[key];
      });

      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      if (this.sortColumn.includes('updatedAt') || this.sortColumn.includes('createdAt')) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.filteredLandings = filtered;

    if (this.currentPage > this.getTotalPages()) {
      this.currentPage = 1;
    }
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'bi-arrow-down-up';
    return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  getPaginatedLandings(): LandingTableData[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredLandings.slice(start, start + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredLandings.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    const totalPages = this.getTotalPages();
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
    }
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  openCreateModal(): void {
    this.currentLanding = null;
    this.editForm = {
      header: {
        title: 'Bienvenue sur notre boutique',
        subtitle: 'Découvrez nos produits phares et nos meilleures offres !'
      },
      carouselSection: {
        enabled: true,
        title: 'Produits en vedette',
        description: '',
        order: 1,
        selectedProducts: []
      },
      categorySection: {
        enabled: true,
        title: 'Catégories',
        description: '',
        order: 2,
        selectedCategories: []
      },
      alert: {
        enabled: false,
        title: '',
        description: '',
        type: 'info',
        order: 0
      },
      isMain: this.landings.length === 0
    };
    this.showEditModal = true;
  }

  editLanding(landing: ILanding): void {
    this.currentLanding = landing;
    
    // Convertir les produits du carousel en format du formulaire
    const selectedProducts = landing.carouselSection?.products.map(cp => ({
      productId: cp.product.id,
      order: cp.order
    })) || [];

    // Convertir les catégories en format du formulaire
    const selectedCategories = landing.categorySection?.categories.map((category, index) => ({
      categoryId: category.id,
      order: index + 1
    })) || [];

    this.editForm = {
      header: {
        title: landing.header.title,
        subtitle: landing.header.subtitle || ''
      },
      carouselSection: {
        enabled: !!landing.carouselSection,
        title: landing.carouselSection?.title || 'Produits en vedette',
        description: landing.carouselSection?.description || '',
        order: landing.carouselSection?.order || 1,
        selectedProducts
      },
      categorySection: {
        enabled: !!landing.categorySection,
        title: landing.categorySection?.title || 'Catégories',
        description: landing.categorySection?.description || '',
        order: landing.categorySection?.order || 2,
        selectedCategories
      },
      alert: {
        enabled: !!landing.alert,
        title: landing.alert?.title || '',
        description: landing.alert?.description || '',
        type: landing.alert?.type || 'info',
        order: landing.alert?.order || 0
      },
      isMain: landing.isMain || false
    };
    this.showEditModal = true;
  }

  async saveLanding(): Promise<void> {
    try {
      this.isSaving = true;

      // Validation des ordres uniques avant envoi
      this.validateAndFixOrders();

      // Préparer les données de la landing page
      const landingData: ILandingRequest = {
        header: this.editForm.header,
        isMain: this.editForm.isMain
      };

      // Ajouter les sections si activées
      if (this.editForm.carouselSection.enabled) {
        const carouselProducts: ICarouselProductRequest[] = this.editForm.carouselSection.selectedProducts.map(sp => ({
          product: sp.productId,
          order: sp.order
        }));

        landingData.carouselSection = {
          title: this.editForm.carouselSection.title,
          description: this.editForm.carouselSection.description,
          products: carouselProducts,
          order: this.editForm.carouselSection.order
        };
      }

      if (this.editForm.categorySection.enabled) {
        const categorySelections: ICategorySelection[] = this.editForm.categorySection.selectedCategories.map(sc => ({
          category: sc.categoryId,
          order: sc.order
        }));

        landingData.categorySection = {
          title: this.editForm.categorySection.title,
          description: this.editForm.categorySection.description,
          order: this.editForm.categorySection.order,
          categories: categorySelections
        };
      }

      if (this.editForm.alert.enabled) {
        landingData.alert = {
          title: this.editForm.alert.title,
          description: this.editForm.alert.description,
          type: this.editForm.alert.type,
          order: this.editForm.alert.order
        };
      }

      let savedLanding: ILanding;

      if (this.currentLanding) {
        savedLanding = await this.apiService.put(`/landings/${this.currentLanding.id}`, landingData);
      } else {
        savedLanding = await this.apiService.post('/landings', landingData);
      }

      await this.loadLandings();
      await this.loadMainLanding();
      this.closeEditModal();

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      this.isSaving = false;
    }
  }

  private validateAndFixOrders(): void {
    // Réorganiser les produits pour garantir des ordres séquentiels uniques
    this.reorderProducts();
    
    // Réorganiser les catégories pour garantir des ordres séquentiels uniques
    this.reorderCategories();
  }

  // === GESTION DES PRODUITS ===
  
  toggleProductSelection(productId: string): void {
    const existingIndex = this.editForm.carouselSection.selectedProducts.findIndex(p => p.productId === productId);
    
    if (existingIndex > -1) {
      // Supprimer le produit
      this.editForm.carouselSection.selectedProducts.splice(existingIndex, 1);
      // Réorganiser les ordres pour éviter les trous
      this.reorderProducts();
    } else {
      // Ajouter le produit avec l'ordre suivant disponible
      const maxOrder = this.editForm.carouselSection.selectedProducts.length > 0 
        ? Math.max(...this.editForm.carouselSection.selectedProducts.map(p => p.order))
        : 0;
      this.editForm.carouselSection.selectedProducts.push({ 
        productId, 
        order: maxOrder + 1 
      });
    }
  }

  isProductSelected(productId: string): boolean {
    return this.editForm.carouselSection.selectedProducts.some(p => p.productId === productId);
  }

  getOrderedSelectedProducts(): Array<{ productId: string; order: number }> {
    return this.editForm.carouselSection.selectedProducts
      .sort((a, b) => a.order - b.order);
  }

  moveProductUp(productId: string): void {
    const products = this.editForm.carouselSection.selectedProducts.sort((a, b) => a.order - b.order);
    const productIndex = products.findIndex(p => p.productId === productId);
    
    if (productIndex > 0) {
      // Échanger avec le produit précédent
      const temp = products[productIndex].order;
      products[productIndex].order = products[productIndex - 1].order;
      products[productIndex - 1].order = temp;
    }
  }

  moveProductDown(productId: string): void {
    const products = this.editForm.carouselSection.selectedProducts.sort((a, b) => a.order - b.order);
    const productIndex = products.findIndex(p => p.productId === productId);
    
    if (productIndex < products.length - 1) {
      // Échanger avec le produit suivant
      const temp = products[productIndex].order;
      products[productIndex].order = products[productIndex + 1].order;
      products[productIndex + 1].order = temp;
    }
  }

  getProductById(productId: string): Product | null {
    return this.availableProducts.find(p => p.id === productId) || null;
  }

  private reorderProducts(): void {
    this.editForm.carouselSection.selectedProducts = this.editForm.carouselSection.selectedProducts
      .map((product, index) => ({
        ...product,
        order: index + 1
      }));
  }

  // === GESTION DES CATÉGORIES ===

  toggleCategorySelection(categoryId: string): void {
    const existingIndex = this.editForm.categorySection.selectedCategories.findIndex(c => c.categoryId === categoryId);
    
    if (existingIndex > -1) {
      // Supprimer la catégorie
      this.editForm.categorySection.selectedCategories.splice(existingIndex, 1);
      // Réorganiser les ordres pour éviter les trous
      this.reorderCategories();
    } else {
      // Ajouter la catégorie avec l'ordre suivant disponible
      const maxOrder = this.editForm.categorySection.selectedCategories.length > 0 
        ? Math.max(...this.editForm.categorySection.selectedCategories.map(c => c.order))
        : 0;
      this.editForm.categorySection.selectedCategories.push({ 
        categoryId, 
        order: maxOrder + 1 
      });
    }
  }

  isCategorySelected(categoryId: string): boolean {
    return this.editForm.categorySection.selectedCategories.some(c => c.categoryId === categoryId);
  }

  getOrderedSelectedCategories(): Array<{ categoryId: string; order: number }> {
    return this.editForm.categorySection.selectedCategories
      .sort((a, b) => a.order - b.order);
  }

  moveCategoryUp(categoryId: string): void {
    const categories = this.editForm.categorySection.selectedCategories.sort((a, b) => a.order - b.order);
    const categoryIndex = categories.findIndex(c => c.categoryId === categoryId);
    
    if (categoryIndex > 0) {
      // Échanger avec la catégorie précédente
      const temp = categories[categoryIndex].order;
      categories[categoryIndex].order = categories[categoryIndex - 1].order;
      categories[categoryIndex - 1].order = temp;
    }
  }

  moveCategoryDown(categoryId: string): void {
    const categories = this.editForm.categorySection.selectedCategories.sort((a, b) => a.order - b.order);
    const categoryIndex = categories.findIndex(c => c.categoryId === categoryId);
    
    if (categoryIndex < categories.length - 1) {
      // Échanger avec la catégorie suivante
      const temp = categories[categoryIndex].order;
      categories[categoryIndex].order = categories[categoryIndex + 1].order;
      categories[categoryIndex + 1].order = temp;
    }
  }

  getCategoryById(categoryId: string): ICategory | null {
    return this.availableCategories.find(c => c.id === categoryId) || null;
  }

  private reorderCategories(): void {
    this.editForm.categorySection.selectedCategories = this.editForm.categorySection.selectedCategories
      .map((category, index) => ({
        ...category,
        order: index + 1
      }));
  }

  // === AUTRES MÉTHODES ===

  async setAsMain(landingId: string): Promise<void> {
    try {
      const landing = this.landings.find(l => l.id === landingId);
      if (!landing) return;

      await this.apiService.put(`/landings/${landingId}`, { ...landing, isMain: true });
      
      await this.loadLandings();
      await this.loadMainLanding();

    } catch (error) {
      console.error('Erreur lors de la définition de la page principale:', error);
    }
  }

  async deleteLanding(landingId: string): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette landing page ?')) return;

    try {
      await this.apiService.delete(`/landings/${landingId}`);
      
      this.landings = this.landings.filter(l => l.id !== landingId);
      this.applyFiltersAndSort();

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }

  previewLanding(landing: ILanding): void {
    // Convertir les données pour l'aperçu
    this.previewData = {
      ...landing,
      carouselSection: landing.carouselSection ? {
        ...landing.carouselSection,
        displayProducts: this.getDisplayProductsFromCarousel(landing.carouselSection.products)
      } : null,
      categorySection: landing.categorySection ? {
        ...landing.categorySection,
        displayCategories: landing.categorySection.categories.map((category, index) => ({
          ...category,
          order: index + 1
        }))
      } : null
    };
    this.showPreviewModal = true;
  }

  previewLandingForm(): void {
    // Créer un objet landing temporaire à partir du formulaire
    const tempLanding: any = {
      header: this.editForm.header,
      carouselSection: this.editForm.carouselSection.enabled ? {
        title: this.editForm.carouselSection.title,
        description: this.editForm.carouselSection.description,
        order: this.editForm.carouselSection.order,
        displayProducts: this.getDisplayProductsFromForm()
      } : null,
      categorySection: this.editForm.categorySection.enabled ? {
        title: this.editForm.categorySection.title,
        description: this.editForm.categorySection.description,
        order: this.editForm.categorySection.order,
        displayCategories: this.getDisplayCategoriesFromForm()
      } : null,
      alert: this.editForm.alert.enabled ? {
        title: this.editForm.alert.title,
        description: this.editForm.alert.description,
        type: this.editForm.alert.type,
        order: this.editForm.alert.order
      } : null
    };

    this.previewData = tempLanding;
    this.showPreviewModal = true;
  }

  private getDisplayProductsFromCarousel(carouselProducts: ICarouselProductPopulated[]): DisplayProduct[] {
    return carouselProducts
      .map(cp => {
        const productData = cp.product;
        return {
          id: productData.id,
          name: productData.name,
          monthlyPrice: productData.monthlyPrice,
          yearlyPrice: productData.yearlyPrice,
          imageUrl: productData.imageUrl,
          order: cp.order
        };
      })
      .sort((a, b) => a.order - b.order);
  }

  private getDisplayProductsFromForm(): DisplayProduct[] {
    return this.editForm.carouselSection.selectedProducts
      .map(sp => {
        const product = this.availableProducts.find(p => p.id === sp.productId);
        if (product) {
          return {
            id: product.id,
            name: product.name,
            monthlyPrice: product.monthlyPrice,
            yearlyPrice: product.yearlyPrice,
            imageUrl: product.imageUrl,
            order: sp.order
          };
        }
        return null;
      })
      .filter(p => p !== null)
      .sort((a, b) => a!.order - b!.order) as DisplayProduct[];
  }

  private getDisplayCategoriesFromForm(): any[] {
    return this.editForm.categorySection.selectedCategories
      .map(sc => {
        const category = this.availableCategories.find(c => c.id === sc.categoryId);
        if (category) {
          return {
            id: category.id,
            name: category.name,
            description: category.description,
            imageUrl: category.imageUrl,
            order: sc.order
          };
        }
        return null;
      })
      .filter(c => c !== null)
      .sort((a, b) => a!.order - b!.order);
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.currentLanding = null;
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
    this.previewData = null;
  }

  getAlertBadgeClass(type: string): string {
    const classes = {
      info: 'bg-info',
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-danger'
    };
    return classes[type as keyof typeof classes] || 'bg-secondary';
  }

  getAlertClass(type: string): string {
    const classes = {
      info: 'alert-info',
      success: 'alert-success',
      warning: 'alert-warning',
      error: 'alert-danger'
    };
    return classes[type as keyof typeof classes] || 'alert-secondary';
  }

  getAlertIcon(type: string): string {
    const icons = {
      info: 'bi-info-circle',
      success: 'bi-check-circle',
      warning: 'bi-exclamation-triangle',
      error: 'bi-x-circle'
    };
    return icons[type as keyof typeof icons] || 'bi-info-circle';
  }

  shouldShowSection(section: any): boolean {
    return section && (section.order !== undefined ? section.order >= 0 : true);
  }

  getOrderedSections(): any[] {
    const sections: any[] = [];

    // Ajouter l'alerte si elle existe
    if (this.previewData?.alert) {
      sections.push({
        type: 'alert',
        order: this.previewData.alert.order || 0,
        data: this.previewData.alert
      });
    }

    // Ajouter la section carousel si elle existe
    if (this.previewData?.carouselSection && this.previewData.carouselSection.displayProducts?.length > 0) {
      sections.push({
        type: 'carousel',
        order: this.previewData.carouselSection.order || 1,
        data: this.previewData.carouselSection
      });
    }

    // Ajouter la section catégories si elle existe
    if (this.previewData?.categorySection && this.previewData.categorySection.displayCategories?.length > 0) {
      sections.push({
        type: 'category',
        order: this.previewData.categorySection.order || 2,
        data: this.previewData.categorySection
      });
    }

    return sections.sort((a, b) => a.order - b.order);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  truncateDescription(description: string | undefined, maxLength: number = 50): string {
    if (!description) return '';
    return description.length > maxLength ? description.slice(0, maxLength) + '...' : description;
  }
}