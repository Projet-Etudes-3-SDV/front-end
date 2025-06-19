import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'client' | 'admin' | 'superadmin';
  createdAt: string;
  lastLogin?: string;
  orderCount?: number;
  subscriptions?: any[];
  activeSubscriptionsCount?: number;
}

interface UserTableData extends User {
  fullName: string;
  selected: boolean;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: false
})
export class UsersPage implements OnInit {
  users: UserTableData[] = [];
  filteredUsers: UserTableData[] = [];
  selectedUsers: Set<string> = new Set();

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Tri
  sortColumn = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Filtres et recherche
  searchTerm = '';
  roleFilter = '';

  // États
  isLoading = true;
  isDeleting = false;
  showDeleteModal = false;
  showEditModal = false;
  showDetailsModal = false;

  // Utilisateur en cours d'édition/affichage
  currentUser: User | null = null;
  editForm: Partial<User> = {};

  // Utilisateurs à supprimer
  usersToDelete: string[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    try {
      this.isLoading = true;

      const response = await this.apiService.get('/users', {
        params: {
          page: this.currentPage,
          limit: this.itemsPerPage
        }
      });

      const usersData = this.extractDataArray(response.data.result);
      this.totalItems = response.data.total || usersData.length;

      this.users = usersData.map(user => ({
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
        selected: false,
        activeSubscriptionsCount: Array.isArray(user.subscriptions)
          ? user.subscriptions.filter((sub: any) => sub.status === 'active').length
          : 0,
        createdAt: user.createdAt || new Date().toISOString()
      }));

      this.applyFiltersAndSort();

    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private extractDataArray(response: any): User[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && response.result && Array.isArray(response.result)) {
      return response.result;
    }
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.users];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    if (this.roleFilter) {
      filtered = filtered.filter(user => user.role === this.roleFilter);
    }

    filtered.sort((a, b) => {
      let aValue: any = a[this.sortColumn as keyof UserTableData];
      let bValue: any = b[this.sortColumn as keyof UserTableData];

      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      if (this.sortColumn === 'createdAt' || this.sortColumn === 'lastLogin') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.filteredUsers = filtered;

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

  getPaginatedUsers(): UserTableData[] {
    return this.filteredUsers;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  toggleUserSelection(userId: string): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.selected = !user.selected;
      if (user.selected) {
        this.selectedUsers.add(userId);
      } else {
        this.selectedUsers.delete(userId);
      }
    }
  }

  toggleAllSelection(): void {
    const currentPageUsers = this.getPaginatedUsers();
    const allSelected = currentPageUsers.every(user => user.selected);

    currentPageUsers.forEach(user => {
      user.selected = !allSelected;
      if (user.selected) {
        this.selectedUsers.add(user.id);
      } else {
        this.selectedUsers.delete(user.id);
      }
    });
  }

  get hasSelectedUsers(): boolean {
    return this.selectedUsers.size > 0;
  }

  get allCurrentPageSelected(): boolean {
    const currentPageUsers = this.getPaginatedUsers();
    return currentPageUsers.length > 0 && currentPageUsers.every(user => user.selected);
  }

  viewUserDetails(user: User): void {
    this.currentUser = user;
    this.showDetailsModal = true;
  }

  editUser(user: User): void {
    this.currentUser = user;
    this.editForm = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    this.showEditModal = true;
  }

  async saveUser(): Promise<void> {
    if (!this.currentUser || !this.editForm) return;

    try {
      await this.apiService.put(`/users/${this.currentUser.id}`, this.editForm);

      const userIndex = this.users.findIndex(u => u.id === this.currentUser!.id);
      if (userIndex !== -1) {
        this.users[userIndex] = {
          ...this.users[userIndex],
          ...this.editForm,
          fullName: `${this.editForm.firstName} ${this.editForm.lastName}`
        };
      }

      this.applyFiltersAndSort();
      this.closeEditModal();

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }

  deleteUser(userId: string): void {
    this.usersToDelete = [userId];
    this.showDeleteModal = true;
  }

  deleteSelectedUsers(): void {
    this.usersToDelete = Array.from(this.selectedUsers);
    this.showDeleteModal = true;
  }

  async confirmDelete(): Promise<void> {
    if (this.usersToDelete.length === 0) return;

    try {
      this.isDeleting = true;

      for (const userId of this.usersToDelete) {
        await this.apiService.delete(`/users/${userId}`);
      }

      this.users = this.users.filter(user => !this.usersToDelete.includes(user.id));
      this.selectedUsers.clear();
      this.applyFiltersAndSort();

      this.closeDeleteModal();

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      this.isDeleting = false;
    }
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.currentUser = null;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.currentUser = null;
    this.editForm = {};
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.usersToDelete = [];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'superadmin': return 'Super Administrateur';
      default: return 'Client';
    }
  }

  getStatusBadgeClass(status: string): string {
    return status === 'active' ? 'bg-success' : 'bg-secondary';
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin': return 'bg-primary';
      case 'superadmin': return 'bg-danger';
      default: return 'bg-info';
    }
  }

  exportCSV(): void {
    const headers = [
      'Nom complet',
      'Email',
      'Téléphone',
      'Rôle',
      'Statut',
      'Date d\'inscription',
      'Dernière connexion',
      'Abonnements actifs'
    ];

    const csvData = this.filteredUsers.map(user => [
      user.fullName,
      user.email,
      user.phone || '',
      this.getRoleLabel(user.role),
      this.formatDate(user.createdAt),
      user.lastLogin ? this.formatDate(user.lastLogin) : 'Jamais',
      user.activeSubscriptionsCount?.toString() || '0'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }
}