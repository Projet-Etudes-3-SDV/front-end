import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category?: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
  };
  available: boolean;
  features: Array<{
    title: string;
    description: string;
  }>;
  imageUrl?: string;
}

export interface OrderProduct {
  product: Product;
  plan: 'monthly' | 'yearly';
}

export interface StatusHistory {
  status: string;
  date: string;
  comment?: string;
}

export interface Order {
  id: string;
  user: User;
  total: number;
  status: 'paid' | 'pending' | 'cancelled' | 'failed';
  products: OrderProduct[];
  orderDate: string;
  customerEmail?: string;
  customerId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  productId?: string;
  productName?: string;
  product?: Product;
  subscriptionType?: 'monthly' | 'yearly';
  amount?: number;
  createdAt?: string;
  updatedAt?: string;
  nextBillingDate?: string;
  statusHistory?: StatusHistory[];
}

interface OrderTableData extends Order {
  selected: boolean;
}

interface OrderMetrics {
  total: number;
  active: number;
  pending: number;
  cancelled: number;
  pastDue: number;
  totalRevenue: number;
}

interface StatusFormData {
  newStatus: string;
  comment: string;
  notifyCustomer: boolean;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: false
})
export class OrdersPage implements OnInit {
  orders: OrderTableData[] = [];
  filteredOrders: OrderTableData[] = [];
  selectedOrders: Set<string> = new Set();
  availableProducts: Product[] = [];
  orderMetrics: OrderMetrics = {
    total: 0,
    active: 0,
    pending: 0,
    cancelled: 0,
    pastDue: 0,
    totalRevenue: 0
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Tri
  sortColumn = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Filtres et recherche
  searchTerm = '';
  statusFilter = '';
  subscriptionTypeFilter = '';
  productFilter = '';
  dateFrom = '';
  dateTo = '';

  // États
  isLoading = true;
  isSaving = false;
  showDetailsModal = false;
  showStatusModal = false;

  // Données modales
  currentOrder: Order | null = null;
  statusForm: StatusFormData = {
    newStatus: '',
    comment: '',
    notifyCustomer: true
  };

  constructor(public apiService: ApiService) { }

  ngOnInit() {
    this.loadOrders();
    this.loadProducts();
    this.calculateMetrics();
  }

  async loadOrders(): Promise<void> {
    try {
      this.isLoading = true;

      const response = await this.apiService.get('/orders', {
        params: {
          page: this.currentPage,
          limit: this.itemsPerPage
        }
      });

      const ordersData = this.extractDataArray(response);
      this.totalItems = response.total || ordersData.length;

      this.orders = ordersData.map(order => {
        
        const firstProduct = order.products && order.products.length > 0 ? order.products[0] : null;
        const product = firstProduct?.product;
        
        const statusMapping: {[key: string]: 'active' | 'pending' | 'cancelled' | 'past_due'} = {
          'paid': 'active',
          'pending': 'pending', 
          'cancelled': 'cancelled',
          'failed': 'cancelled'
        };

        const adaptedOrder: OrderTableData = {
          id: order.id,
          user: order.user,
          total: order.total,
          status: order.status,
          products: order.products || [],
          orderDate: order.orderDate,
          customerEmail: order.user?.email || '',
          customerId: order.user?.id || '',
          stripeCustomerId: '',
          stripeSubscriptionId: '',
          productId: product?.id || '',
          productName: product?.name || 'Commande multi-produits',
          product: product,
          subscriptionType: firstProduct?.plan as 'monthly' | 'yearly' || 'monthly',
          amount: order.total,
          createdAt: order.orderDate,
          updatedAt: order.orderDate,
          nextBillingDate: this.calculateNextBillingDate({
            createdAt: order.orderDate,
            subscriptionType: firstProduct?.plan as 'monthly' | 'yearly' || 'monthly'
          } as any),
          statusHistory: [],
          selected: false
        };

        return adaptedOrder;
      });

      this.applyFiltersAndSort();
      this.calculateMetrics();

    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadProducts(): Promise<void> {
    try {
      const response = await this.apiService.get('/products');
      this.availableProducts = this.extractDataArray(response);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
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

  private calculateNextBillingDate(order: {createdAt?: string, orderDate?: string, subscriptionType?: string}): string {
    const dateStr = order.createdAt || order.orderDate;
    if (!dateStr) return '';
    
    const createdDate = new Date(dateStr);
    const nextDate = new Date(createdDate);
    
    if (order.subscriptionType === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
    
    return nextDate.toISOString();
  }

  calculateMetrics(): void {
    this.orderMetrics = {
      total: this.orders.length,
      active: this.orders.filter(o => o.status === 'paid').length,
      pending: this.orders.filter(o => o.status === 'pending').length,
      cancelled: this.orders.filter(o => o.status === 'cancelled' || o.status === 'failed').length,
      pastDue: 0,
      totalRevenue: this.orders
        .filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + (o.total || 0), 0)
    };
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.orders];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        (order.customerEmail || '').toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term) ||
        (order.productName || '').toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    if (this.subscriptionTypeFilter) {
      filtered = filtered.filter(order => order.subscriptionType === this.subscriptionTypeFilter);
    }

    if (this.productFilter) {
      filtered = filtered.filter(order => order.productId === this.productFilter);
    }

    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(order => {
        const orderDate = order.createdAt || order.orderDate;
        return orderDate ? new Date(orderDate) >= fromDate : false;
      });
    }

    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => {
        const orderDate = order.createdAt || order.orderDate;
        return orderDate ? new Date(orderDate) <= toDate : false;
      });
    }

    filtered.sort((a, b) => {
      let aValue: any = a[this.sortColumn as keyof OrderTableData];
      let bValue: any = b[this.sortColumn as keyof OrderTableData];

      if (this.sortColumn === 'productName') {
        aValue = a.productName || '';
        bValue = b.productName || '';
      }

      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      if (this.sortColumn === 'createdAt' || this.sortColumn === 'nextBillingDate') {
        const aDateStr = this.sortColumn === 'createdAt' ? (a.createdAt || a.orderDate || '') : aValue;
        const bDateStr = this.sortColumn === 'createdAt' ? (b.createdAt || b.orderDate || '') : bValue;
        aValue = aDateStr ? new Date(aDateStr).getTime() : 0;
        bValue = bDateStr ? new Date(bDateStr).getTime() : 0;
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.filteredOrders = filtered;

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

  getPaginatedOrders(): OrderTableData[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  toggleOrderSelection(orderId: string): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.selected = !order.selected;
      if (order.selected) {
        this.selectedOrders.add(orderId);
      } else {
        this.selectedOrders.delete(orderId);
      }
    }
  }

  toggleAllSelection(): void {
    const currentPageOrders = this.getPaginatedOrders();
    const allSelected = currentPageOrders.every(order => order.selected);

    currentPageOrders.forEach(order => {
      order.selected = !allSelected;
      if (order.selected) {
        this.selectedOrders.add(order.id);
      } else {
        this.selectedOrders.delete(order.id);
      }
    });
  }

  get hasSelectedOrders(): boolean {
    return this.selectedOrders.size > 0;
  }

  get allCurrentPageSelected(): boolean {
    const currentPageOrders = this.getPaginatedOrders();
    return currentPageOrders.length > 0 && currentPageOrders.every(order => order.selected);
  }

  viewOrderDetails(order: Order): void {
    this.currentOrder = order;
    this.showDetailsModal = true;
  }

  editOrderStatus(order: Order): void {
    this.currentOrder = order;
    this.statusForm = {
      newStatus: order.status,
      comment: '',
      notifyCustomer: true
    };
    this.showStatusModal = true;
    this.showDetailsModal = false;
  }

  async saveOrderStatus(): Promise<void> {
    if (!this.currentOrder) return;

    try {
      this.isSaving = true;

      const updateData = {
        status: this.statusForm.newStatus,
        comment: this.statusForm.comment,
        notifyCustomer: this.statusForm.notifyCustomer
      };

      await this.apiService.put(`/orders/${this.currentOrder.id}/status`, updateData);

      const orderIndex = this.orders.findIndex(o => o.id === this.currentOrder!.id);
      if (orderIndex !== -1) {
        this.orders[orderIndex].status = this.statusForm.newStatus as any;
        this.orders[orderIndex].updatedAt = new Date().toISOString();
        
        if (!this.orders[orderIndex].statusHistory) {
          this.orders[orderIndex].statusHistory = [];
        }
        this.orders[orderIndex].statusHistory!.push({
          status: this.statusForm.newStatus,
          date: new Date().toISOString(),
          comment: this.statusForm.comment
        });
      }

      this.applyFiltersAndSort();
      this.calculateMetrics();
      this.closeStatusModal();

    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    } finally {
      this.isSaving = false;
    }
  }

  async bulkUpdateStatus(status: string): Promise<void> {
    if (this.selectedOrders.size === 0) return;

    try {
      for (const orderId of this.selectedOrders) {
        await this.apiService.put(`/orders/${orderId}`, { status });
        
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = status as any;
          this.orders[orderIndex].updatedAt = new Date().toISOString();
        }
      }

      this.selectedOrders.clear();
      this.applyFiltersAndSort();
      this.calculateMetrics();

    } catch (error) {
      console.error('Erreur lors de la mise à jour groupée:', error);
    }
  }

  async cancelOrder(orderId: string): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

    try {
      await this.apiService.put(`/orders/${orderId}`, { status: 'cancelled' });
      
      const orderIndex = this.orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        this.orders[orderIndex].status = 'cancelled';
        this.orders[orderIndex].updatedAt = new Date().toISOString();
      }

      this.applyFiltersAndSort();
      this.calculateMetrics();

    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette commande ? Cette action est irréversible.')) return;

    try {
      await this.apiService.delete(`/orders/${orderId}`);
      
      this.orders = this.orders.filter(o => o.id !== orderId);
      this.selectedOrders.delete(orderId);
      
      this.applyFiltersAndSort();
      this.calculateMetrics();
      
      if (this.currentOrder?.id === orderId) {
        this.closeDetailsModal();
        this.closeStatusModal();
      }

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }

  async bulkDeleteOrders(): Promise<void> {
    if (this.selectedOrders.size === 0) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement ${this.selectedOrders.size} commande(s) ? Cette action est irréversible.`)) return;

    try {
      for (const orderId of this.selectedOrders) {
        await this.apiService.delete(`/orders/${orderId}`);
      }
      
      this.orders = this.orders.filter(o => !this.selectedOrders.has(o.id));
      this.selectedOrders.clear();
      
      this.applyFiltersAndSort();
      this.calculateMetrics();

    } catch (error) {
      console.error('Erreur lors de la suppression groupée:', error);
    }
  }

  async downloadInvoice(orderId: string): Promise<void> {
    try {
      const response = await this.apiService.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });

      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture_${orderId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors du téléchargement de la facture:', error);
    }
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.currentOrder = null;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.currentOrder = null;
    this.statusForm = {
      newStatus: '',
      comment: '',
      notifyCustomer: true
    };
  }

  getCustomerInitials(email: string): string {
    if (!email) return '?';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  }

  getStatusLabel(status: string): string {
    const labels = {
      paid: 'Payée',
      active: 'Active',
      pending: 'En attente',
      cancelled: 'Annulée',
      failed: 'Échouée',
      past_due: 'Impayée'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      paid: 'bg-success',
      active: 'bg-success',
      pending: 'bg-warning',
      cancelled: 'bg-secondary',
      failed: 'bg-danger',
      past_due: 'bg-danger'
    };
    return classes[status as keyof typeof classes] || 'bg-secondary';
  }

  getStatusIcon(status: string): string {
    const icons = {
      paid: 'bi-check-circle',
      active: 'bi-check-circle',
      pending: 'bi-clock',
      cancelled: 'bi-x-circle',
      failed: 'bi-exclamation-triangle',
      past_due: 'bi-exclamation-triangle'
    };
    return icons[status as keyof typeof icons] || 'bi-question-circle';
  }

  getStatusTimelineClass(status: string): string {
    const classes = {
      paid: 'timeline-active',
      active: 'timeline-active',
      pending: 'timeline-pending',
      cancelled: 'timeline-cancelled',
      failed: 'timeline-cancelled',
      past_due: 'timeline-past_due'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getSubscriptionLabel(type: string): string {
    return type === 'monthly' ? 'Mensuel' : 'Annuel';
  }

  getSubscriptionBadgeClass(type: string): string {
    return type === 'monthly' ? 'bg-primary' : 'bg-info';
  }

  getSubscriptionIcon(type: string): string {
    return type === 'monthly' ? 'bi-calendar-month' : 'bi-calendar-date';
  }

  getPaymentFrequency(type: string): string {
    return type === 'monthly' ? 'Chaque mois' : 'Chaque année';
  }

  getNextBillingStatus(nextBillingDate: string): string {
    if (!nextBillingDate) return '';
    
    const next = new Date(nextBillingDate);
    const now = new Date();
    const diffTime = next.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'En retard';
    } else if (diffDays === 0) {
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
      return 'Demain';
    } else if (diffDays <= 7) {
      return `Dans ${diffDays} jours`;
    } else {
      return `Dans ${Math.ceil(diffDays / 7)} semaines`;
    }
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

  formatTime(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  exportCSV(): void {
    const headers = [
      'ID Commande',
      'Email Client',
      'Produit',
      'Type d\'abonnement',
      'Montant',
      'Statut',
      'Date de création',
      'Prochaine facturation',
      'Stripe Customer ID',
      'Stripe Subscription ID'
    ];

    const csvData = this.filteredOrders.map(order => [
      order.id,
      order.customerEmail || '',
      order.productName || '',
      this.getSubscriptionLabel(order.subscriptionType || 'monthly'),
      (order.amount || order.total || 0).toString(),
      this.getStatusLabel(order.status),
      this.formatDate(order.createdAt || order.orderDate || ''),
      order.nextBillingDate ? this.formatDate(order.nextBillingDate) : '',
      order.stripeCustomerId || '',
      order.stripeSubscriptionId || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `commandes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }
}