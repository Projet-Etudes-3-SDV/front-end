import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface Feature {
  title: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  monthlyPrice: number;
  yearlyPrice: number;
  available: boolean;
  features: Feature[];
  imageUrl?: string;
  stripeProductId: string;
  stripePriceId: string;
  stripePriceIdYearly: string;
  monthlyPurchaseAmount: number;
  yearlyPurchaseAmount: number;
  addedDate: string;
}

interface ProductTableData extends Omit<Product, 'features'> {
  selected: boolean;
  features: Feature[];
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  monthlyPrice: number;
  yearlyPrice: number;
  available: boolean;
  features: Feature[];
  imageUrl?: string;
  imageFile?: File;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: false
})
export class ProductsPage implements OnInit {
  products: ProductTableData[] = [];
  filteredProducts: ProductTableData[] = [];
  selectedProducts: Set<string> = new Set();
  availableCategories: Category[] = [];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Tri
  sortColumn = 'addedDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Filtres et recherche
  searchTerm = '';
  categoryFilter = '';
  statusFilter = '';

  // États
  isLoading = true;
  isDeleting = false;
  isSaving = false;
  showDeleteModal = false;
  showEditModal = false;
  showDetailsModal = false;
  imageUploadProgress = 0;
  selectedFileName = '';
  selectedImageFile: File | null = null;

  // Produit en cours d'édition/affichage
  currentProduct: Product | null = null;
  editForm: ProductFormData = {
    name: '',
    description: '',
    category: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    available: true,
    features: [],
    imageUrl: ''
  };

  // Produits à supprimer
  productsToDelete: string[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  async loadProducts(): Promise<void> {
    try {
      this.isLoading = true;

      const response = await this.apiService.get('/products/admin', {
        params: {
          page: this.currentPage,
          limit: this.itemsPerPage
        }
      });

      const productsData = this.extractDataArray(response);
      this.totalItems = response.total || productsData.length;

      this.products = productsData.map(product => {
        // Convertir les features en objets Feature
        const convertedFeatures: Feature[] = Array.isArray(product.features) 
          ? product.features.map((f: any) => {
              // Si c'est déjà un objet avec title/description, on le garde
              if (f && typeof f === 'object' && f.title) {
                return {
                  title: f.title,
                  description: f.description || ''
                } as Feature;
              }
              // Si c'est une string, on la convertit en objet
              if (typeof f === 'string') {
                return {
                  title: f,
                  description: ''
                } as Feature;
              }
              return {
                title: '',
                description: ''
              } as Feature;
            })
          : [];

        return {
          ...product,
          selected: false,
          features: convertedFeatures,
          monthlyPurchaseAmount: product.monthlyPurchaseAmount || 0,
          yearlyPurchaseAmount: product.yearlyPurchaseAmount || 0,
          addedDate: product.addedDate || new Date().toISOString(),
          category: product.category || { id: '', name: 'Non catégorisé', description: '' }
        } as ProductTableData;
      });

      this.applyFiltersAndSort();

    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadCategories(): Promise<void> {
    try {
      const response = await this.apiService.get('/categories');
      this.availableCategories = this.extractDataArray(response);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      // Catégories par défaut si l'API n'existe pas encore
      this.availableCategories = [
        { id: '1', name: 'SOC', description: 'Security Operations Center' },
        { id: '2', name: 'EDR', description: 'Endpoint Detection and Response' },
        { id: '3', name: 'XDR', description: 'Extended Detection and Response' }
      ];
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
    let filtered = [...this.products];

    // Recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      );
    }

    // Filtres
    if (this.categoryFilter) {
      filtered = filtered.filter(product => product.category.id === this.categoryFilter);
    }

    if (this.statusFilter !== '') {
      const isAvailable = this.statusFilter === 'true';
      filtered = filtered.filter(product => product.available === isAvailable);
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortColumn as keyof ProductTableData];
      let bValue: any = b[this.sortColumn as keyof ProductTableData];

      // Gestion des cas spéciaux
      if (this.sortColumn === 'category') {
        aValue = a.category.name || '';
        bValue = b.category.name || '';
      } else if (this.sortColumn === 'purchaseStats') {
        aValue = (a.monthlyPurchaseAmount || 0) + (a.yearlyPurchaseAmount || 0);
        bValue = (b.monthlyPurchaseAmount || 0) + (b.yearlyPurchaseAmount || 0);
      }

      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      if (this.sortColumn === 'addedDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.filteredProducts = filtered;

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

  // Pagination
  getPaginatedProducts(): ProductTableData[] {
    return this.filteredProducts;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  // Sélection
  toggleProductSelection(productId: string): void {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.selected = !product.selected;
      if (product.selected) {
        this.selectedProducts.add(productId);
      } else {
        this.selectedProducts.delete(productId);
      }
    }
  }

  toggleAllSelection(): void {
    const currentPageProducts = this.getPaginatedProducts();
    const allSelected = currentPageProducts.every(product => product.selected);

    currentPageProducts.forEach(product => {
      product.selected = !allSelected;
      if (product.selected) {
        this.selectedProducts.add(product.id);
      } else {
        this.selectedProducts.delete(product.id);
      }
    });
  }

  get hasSelectedProducts(): boolean {
    return this.selectedProducts.size > 0;
  }

  get allCurrentPageSelected(): boolean {
    const currentPageProducts = this.getPaginatedProducts();
    return currentPageProducts.length > 0 && currentPageProducts.every(product => product.selected);
  }

  // Actions CRUD
  openCreateModal(): void {
    this.currentProduct = null;
    this.editForm = {
      name: '',
      description: '',
      category: '',
      monthlyPrice: 0,
      yearlyPrice: 0,
      available: true,
      features: [{ title: '', description: '' }],
      imageUrl: '',
      imageFile: undefined
    };
    this.imageUploadProgress = 0;
    this.showEditModal = true;
  }

  viewProductDetails(product: Product): void {
    this.currentProduct = product;
    this.showDetailsModal = true;
  }

  editProduct(product: Product): void {
    
    this.currentProduct = product;
    
    // S'assurer que les features sont correctement copiées
    let productFeatures: Feature[];
    
    if (Array.isArray(product.features) && product.features.length > 0) {
      productFeatures = product.features.map((f, index) => {
        if (f && typeof f === 'object' && f.title !== undefined) {
          return {
            title: f.title || '',
            description: f.description || ''
          };
        } else if (typeof f === 'string') {
          return {
            title: f,
            description: ''
          };
        } else {
          return {
            title: '',
            description: ''
          };
        }
      });
    } else {
      console.log('Aucune feature trouvée, création d\'une feature vide');
      productFeatures = [{ title: '', description: '' }];
    }
    
    this.editForm = {
      name: product.name,
      description: product.description,
      category: product.category.id || '',
      monthlyPrice: product.monthlyPrice,
      yearlyPrice: product.yearlyPrice,
      available: product.available,
      features: productFeatures,
      imageUrl: product.imageUrl || '',
      imageFile: undefined
    };
    
    this.imageUploadProgress = 0;
    this.selectedFileName = '';
    this.selectedImageFile = null;
    this.showEditModal = true;
    this.showDetailsModal = false;
  }

  async saveProduct(): Promise<void> {
    if (!this.editForm) return;

    try {
      this.isSaving = true;

      // Nettoyer les features vides et s'assurer qu'elles sont valides
      const cleanedFeatures = this.editForm.features
        .filter(f => f && f.title && f.title.trim() !== '')
        .map(f => ({
          title: f.title.trim(),
          description: f.description ? f.description.trim() : ''
        }));

      const productData = {
        name: this.editForm.name,
        description: this.editForm.description,
        category: this.editForm.category,
        monthlyPrice: this.editForm.monthlyPrice,
        yearlyPrice: this.editForm.yearlyPrice,
        available: this.editForm.available,
        features: cleanedFeatures
      };

      let savedProduct: any;

      if (this.currentProduct) {
        savedProduct = await this.apiService.put(`/products/${this.currentProduct.id}`, productData);
        savedProduct = { ...savedProduct, id: this.currentProduct.id };
      } else {
        savedProduct = await this.apiService.post('/products', productData);
      }

      const fileToUpload = this.selectedImageFile || this.editForm.imageFile;
      
      if (fileToUpload && savedProduct?.id) {
        await this.uploadProductImage(savedProduct.id, fileToUpload);
      } else {
        if (!fileToUpload) {
          console.log('Aucune image sélectionnée, pas d\'upload');
        }
        if (!savedProduct?.id) {
          console.log('Pas d\'ID de produit, impossible d\'uploader l\'image');
        }
      }

      await this.loadProducts();
      this.closeEditModal();

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      this.isSaving = false;
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];

      if (!allowedTypes.includes(file.type)) {
        alert('Format d\'image non supporté. Utilisez JPG, PNG, GIF ou SVG.');
        event.target.value = '';
        return;
      }

      if (file.size > maxSize) {
        alert('L\'image est trop volumineuse. Taille maximum: 5MB.');
        event.target.value = '';
        return;
      }

      this.selectedImageFile = file;
      this.selectedFileName = file.name;
      this.editForm.imageFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editForm.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      console.log('Aucun fichier sélectionné');
      this.selectedImageFile = null;
      this.selectedFileName = '';
      this.editForm.imageFile = undefined;
    }
  }

  async uploadProductImage(productId: string, file: File): Promise<void> {
    try {
      const formData = new FormData();
      
      if (!(file instanceof File)) {
        throw new Error('Le fichier n\'est pas de type File');
      }
      
      formData.append('file', file, file.name);

      this.imageUploadProgress = 0;
      const uploadInterval = setInterval(() => {
        this.imageUploadProgress += 10;
        if (this.imageUploadProgress >= 90) {
          clearInterval(uploadInterval);
        }
      }, 100);
      
      const response = await this.apiService.postImage(`/products/${productId}/image`, formData);

      const result = await response.json();
      
      clearInterval(uploadInterval);
      this.imageUploadProgress = 100;

      if (result && result.imageUrl) {
        this.editForm.imageUrl = result.imageUrl;
        console.log('URL de l\'image mise à jour:', result.imageUrl);
      } else {
        console.log('Pas d\'imageUrl dans la réponse:', result);
      }

      setTimeout(() => {
        this.imageUploadProgress = 0;
      }, 1000);

    } catch (error) {
      console.error('=== ERREUR UPLOAD IMAGE ===');
      console.error('Erreur lors de l\'upload de l\'image:', error);
      this.imageUploadProgress = 0;
      alert('Erreur lors de l\'upload de l\'image. Veuillez réessayer.');
      console.log('=== FIN UPLOAD IMAGE (ERREUR) ===');
    }
  }

  deleteProduct(productId: string): void {
    this.productsToDelete = [productId];
    this.showDeleteModal = true;
  }

  deleteSelectedProducts(): void {
    this.productsToDelete = Array.from(this.selectedProducts);
    this.showDeleteModal = true;
  }

  async confirmDelete(): Promise<void> {
    if (this.productsToDelete.length === 0) return;

    try {
      this.isDeleting = true;

      for (const productId of this.productsToDelete) {
        await this.apiService.delete(`/products/${productId}`);
      }

      this.products = this.products.filter(product => !this.productsToDelete.includes(product.id));
      this.selectedProducts.clear();
      this.applyFiltersAndSort();

      this.closeDeleteModal();

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      this.isDeleting = false;
    }
  }

  async toggleProductStatus(productId: string): Promise<void> {
    try {
      const product = this.products.find(p => p.id === productId);
      if (!product) return;

      const newStatus = !product.available;

      await this.apiService.put(`/products/${productId}`, { 
        ...product, 
        available: newStatus 
      });

      product.available = newStatus;
      this.applyFiltersAndSort();

    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  }

  async toggleSelectedStatus(available: boolean): Promise<void> {
    try {
      for (const productId of this.selectedProducts) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
          await this.apiService.put(`/products/${productId}`, { 
            ...product, 
            available 
          });
          product.available = available;
        }
      }

      this.selectedProducts.clear();
      this.applyFiltersAndSort();

    } catch (error) {
      console.error('Erreur lors du changement de statut groupé:', error);
    }
  }

  // Gestion des features dans le formulaire
  addFeature(): void {
    this.editForm.features.push({ title: '', description: '' });
    console.log('Feature ajoutée. Total features:', this.editForm.features.length);
  }

  removeFeature(index: number): void {
    if (this.editForm.features.length > 1) {
      this.editForm.features.splice(index, 1);
      console.log('Feature supprimée. Total features:', this.editForm.features.length);
    } else {
      console.log('Impossible de supprimer la dernière feature');
    }
  }

  // Gestion des modales
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.currentProduct = null;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.currentProduct = null;
    this.imageUploadProgress = 0;
    this.selectedImageFile = null;
    this.selectedFileName = '';
    this.editForm = {
      name: '',
      description: '',
      category: '',
      monthlyPrice: 0,
      yearlyPrice: 0,
      available: true,
      features: [],
      imageUrl: '',
      imageFile: undefined
    };
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.productsToDelete = [];
  }

  // Utilitaires
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getStatusLabel(available: boolean): string {
    return available ? 'Disponible' : 'Indisponible';
  }

  getStatusBadgeClass(available: boolean): string {
    return available ? 'bg-success' : 'bg-secondary';
  }

  getYearlySavings(product: Product): string {
    const monthlyCost = product.monthlyPrice * 12;
    const savings = monthlyCost - product.yearlyPrice;
    if (savings > 0) {
      const percentage = Math.round((savings / monthlyCost) * 100);
      return `Économie de ${this.formatCurrency(savings)} (${percentage}%)`;
    }
    return 'Aucune économie';
  }

  getFormYearlySavings(): string {
    if (!this.editForm.monthlyPrice || !this.editForm.yearlyPrice) return '';
    const monthlyCost = this.editForm.monthlyPrice * 12;
    const savings = monthlyCost - this.editForm.yearlyPrice;
    if (savings > 0) {
      const percentage = Math.round((savings / monthlyCost) * 100);
      return `${this.formatCurrency(savings)} (${percentage}%)`;
    }
    return 'Aucune économie';
  }

  getTotalRevenue(product: Product): number {
    const monthlyRevenue = (product.monthlyPurchaseAmount || 0) * product.monthlyPrice;
    const yearlyRevenue = (product.yearlyPurchaseAmount || 0) * product.yearlyPrice;
    return monthlyRevenue + yearlyRevenue;
  }

  // Export CSV
  exportCSV(): void {
    const headers = [
      'Nom',
      'Description',
      'Catégorie',
      'Prix mensuel',
      'Prix annuel',
      'Statut',
      'Ventes mensuelles',
      'Ventes annuelles',
      'CA total',
      'Date d\'ajout'
    ];

    const csvData = this.filteredProducts.map(product => [
      product.name,
      product.description,
      product.category.name || 'N/A',
      product.monthlyPrice.toString(),
      product.yearlyPrice.toString(),
      this.getStatusLabel(product.available),
      (product.monthlyPurchaseAmount || 0).toString(),
      (product.yearlyPurchaseAmount || 0).toString(),
      this.getTotalRevenue(product).toString(),
      this.formatDate(product.addedDate)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `produits_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}