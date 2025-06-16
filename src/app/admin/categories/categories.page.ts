import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  selected?: boolean;
}

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: false
})
export class CategoriesPage implements OnInit {

  // Données
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Tri et filtres
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm = '';

  // Sélection
  selectedCategories = new Set<string>();

  // États
  isLoading = true;
  isSaving = false;
  isDeleting = false;
  showEditModal = false;
  showDetailsModal = false;
  showDeleteModal = false;

  // Données modales
  currentCategory: Category | null = null;
  categoryForm: CategoryFormData = {
    name: '',
    description: '',
    imageUrl: ''
  };
  categoriesToDelete: string[] = [];

  constructor(
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  // Chargement des données
  async loadCategories(): Promise<void> {
    try {
      this.isLoading = true;
      const response = await this.apiService.get('/categories');
      
      if (response && Array.isArray(response.data.result)) {
        this.categories = response.data.result.map((category: Category) => ({
          ...category,
          selected: false
        }));
        this.totalItems = response.total || this.categories.length;
      } else {
        this.categories = [];
        this.totalItems = 0;
      }

      this.applyFiltersAndSort();

    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      this.categories = [];
    } finally {
      this.isLoading = false;
    }
  }

  // Filtres et tri
  applyFiltersAndSort(): void {
    let filtered = [...this.categories];

    // Recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortBy as keyof Category];
      let bValue: any = b[this.sortBy as keyof Category];

      if (this.sortBy === 'createdAt' || this.sortBy === 'updatedAt') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      } else {
        aValue = (aValue || '').toString().toLowerCase();
        bValue = (bValue || '').toString().toLowerCase();
      }

      if (this.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredCategories = filtered;
    
    // Ajuster la page courante si nécessaire
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages && totalPages > 0) {
      this.currentPage = totalPages;
    }
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) return 'bi-arrow-down-up';
    return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  // Pagination
  getPaginatedCategories(): Category[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCategories.slice(start, start + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredCategories.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    const totalPages = this.getTotalPages();
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
    }
  }

  getPaginationArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  // Sélection
  get hasSelectedCategories(): boolean {
    return this.selectedCategories.size > 0;
  }

  get allCurrentPageSelected(): boolean {
    const currentPageCategories = this.getPaginatedCategories();
    return currentPageCategories.length > 0 && 
           currentPageCategories.every(category => this.selectedCategories.has(category.id));
  }

  toggleAllSelection(): void {
    const currentPageCategories = this.getPaginatedCategories();
    const allSelected = this.allCurrentPageSelected;

    currentPageCategories.forEach(category => {
      category.selected = !allSelected;
      if (!allSelected) {
        this.selectedCategories.add(category.id);
      } else {
        this.selectedCategories.delete(category.id);
      }
    });
  }

  toggleCategorySelection(categoryId: string): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      category.selected = !category.selected;
      if (category.selected) {
        this.selectedCategories.add(categoryId);
      } else {
        this.selectedCategories.delete(categoryId);
      }
    }
  }

  // CRUD Operations
  async createCategory(): Promise<void> {
    if (!this.categoryForm.name.trim() || !this.categoryForm.description.trim()) return;

    try {
      this.isSaving = true;
      const newCategory = await this.apiService.post('/categories', this.categoryForm);
      
      this.categories.unshift({
        ...newCategory,
        selected: false
      });
      
      this.closeEditModal();
      this.applyFiltersAndSort();

    } catch (error) {
      console.error('Erreur lors de la création:', error);
    } finally {
      this.isSaving = false;
    }
  }

  async updateCategory(): Promise<void> {
    if (!this.currentCategory || !this.categoryForm.name.trim()) return;

    try {
      this.isSaving = true;
      const updatedCategory = await this.apiService.put(`/categories/${this.currentCategory.id}`, this.categoryForm);
      
      const index = this.categories.findIndex(c => c.id === this.currentCategory!.id);
      if (index !== -1) {
        this.categories[index] = { 
          ...this.categories[index], 
          ...updatedCategory, 
          selected: this.categories[index].selected 
        };
      }

      this.closeEditModal();
      this.applyFiltersAndSort();

    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      this.isSaving = false;
    }
  }

  saveCategory(): void {
    if (this.currentCategory) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  deleteCategory(categoryId: string): void {
    this.categoriesToDelete = [categoryId];
    this.showDeleteModal = true;
  }

  deleteSelectedCategories(): void {
    this.categoriesToDelete = Array.from(this.selectedCategories);
    this.showDeleteModal = true;
  }

  async confirmDelete(): Promise<void> {
    try {
      this.isDeleting = true;

      for (const categoryId of this.categoriesToDelete) {
        await this.apiService.delete(`/categories/${categoryId}`);
      }
      
      this.categories = this.categories.filter(c => !this.categoriesToDelete.includes(c.id));
      this.categoriesToDelete.forEach(id => this.selectedCategories.delete(id));
      
      this.closeDeleteModal();
      this.applyFiltersAndSort();

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      this.isDeleting = false;
    }
  }

  // Gestion des modales
  openCreateModal(): void {
    this.currentCategory = null;
    this.categoryForm = {
      name: '',
      description: '',
      imageUrl: ''
    };
    this.showEditModal = true;
  }

  openEditModal(category: Category): void {
    this.currentCategory = category;
    this.categoryForm = {
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl || ''
    };
    this.showEditModal = true;
    this.showDetailsModal = false;
  }

  viewCategoryDetails(category: Category): void {
    this.currentCategory = category;
    this.showDetailsModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.currentCategory = null;
    this.categoryForm = {
      name: '',
      description: '',
      imageUrl: ''
    };
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.currentCategory = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.categoriesToDelete = [];
  }

  // Utilitaires d'affichage
  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCategoryInitials(name: string): string {
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('/uploads')) {
      return `http://localhost:3000/api${imageUrl}`;
    }
    return imageUrl;
  }

  truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text || '';
    return text.substr(0, maxLength) + '...';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  // Actions rapides
  refreshCategories(): void {
    this.loadCategories();
  }

  // Export
  exportToCSV(): void {
    const headers = ['ID', 'Nom', 'Description', 'URL Image', 'Date de création'];
    const csvData = this.filteredCategories.map(category => [
      category.id,
      category.name,
      category.description.replace(/\n/g, ' '),
      category.imageUrl || '',
      this.formatDate(category.createdAt || '')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `categories_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}