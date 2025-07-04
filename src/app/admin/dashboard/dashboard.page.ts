import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { User } from '../../types/user.interface';
import { Product } from '../../types/product.interface';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  status: string;
  planType: string;
  startDate: string;
  endDate: string;
  cancelAtPeriodEnd: boolean;
  coupon?: {
    name: string;
    reduction: number;
    reductionType: string;
    startDate: string;
    endDate: string;
  };
}

interface OrderWithUser {
  id: string;
  total: number;
  status: string;
  sessionId?: string;
  orderDate: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
  };
  products: {
    product: {
      id: string;
      _id: string;
      available: boolean;
      active: boolean;
      features: any[];
      addedDate: string;
    };
    plan: string;
  }[];
}

interface ProductAdmin {
  id: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
  };
  monthlyPrice: number;
  yearlyPrice: number;
  available: boolean;
  features: any[];
  imageUrl?: string;
  stripeProductId: string;
  stripePriceId: string;
  stripePriceIdYearly: string;
  monthlyPurchaseAmount: number;
  yearlyPurchaseAmount: number;
}

interface StatCard {
  title: string;
  value: number;
  subValue?: number;
  subLabel?: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  stats: DashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  };

  recentOrders: {
    id: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: string;
    date: Date;
    productsCount: number;
  }[] = [];

  topProducts: {
    id: string;
    name: string;
    category: string;
    orderCount: number;
    revenue: number;
    monthlyCount?: number;
    yearlyCount?: number;
  }[] = [];

  topSubscriptions: {
    id: string;
    name: string;
    count: number;
    revenue: number;
    planType: string;
  }[] = [];

  isLoading = true;
  isLoadingOrders = true;
  isLoadingProducts = true;
  isLoadingStats = true;
  isLoadingSubscriptions = true;

  constructor(private apiService: ApiService) { }

  async ngOnInit() {
    await this.loadDashboardData();
  }

  public async loadDashboardData(): Promise<void> {
    try {
      this.isLoading = true;
      this.isLoadingOrders = true;
      this.isLoadingProducts = true;
      this.isLoadingStats = true;
      this.isLoadingSubscriptions = true;

      const [
        usersResponse,
        productsResponse,
        ordersResponse,
        subscriptionsResponse,
        productsAdminResponse
      ] = await Promise.all([
        this.apiService.get('/users'),
        this.apiService.get('/products'),
        this.apiService.get('/orders'),
        this.apiService.get('/subscriptions'),
        this.apiService.get('/products/admin')
      ]);

      const usersData = this.extractDataArray(usersResponse);
      const productsData = this.extractDataArray(productsResponse);
      const ordersData = this.extractDataArray(ordersResponse);
      const subscriptionsData = this.extractDataArray(subscriptionsResponse);
      const productsAdminData = this.extractDataArray(productsAdminResponse);

      this.calculateStats(usersData, productsData, ordersData, subscriptionsData);

      this.prepareRecentOrders(ordersData);
      this.prepareTopProductsFromAdmin(productsAdminData);
      this.prepareTopSubscriptions(subscriptionsData);

      setTimeout(() => {
        this.isLoading = false;
        this.isLoadingStats = false;
      }, 300);

      setTimeout(() => {
        this.isLoadingOrders = false;
      }, 500);

      setTimeout(() => {
        this.isLoadingProducts = false;
      }, 700);

      setTimeout(() => {
        this.isLoadingSubscriptions = false;
      }, 900);

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      this.isLoading = false;
      this.isLoadingOrders = false;
      this.isLoadingProducts = false;
      this.isLoadingStats = false;
      this.isLoadingSubscriptions = false;
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

    console.warn('Could not extract array from response:', response);
    return [];
  }

  private calculateStats(users: User[], products: Product[], orders: OrderWithUser[], subscriptions: Subscription[]): void {
    users = Array.isArray(users) ? users : [];
    products = Array.isArray(products) ? products : [];
    orders = Array.isArray(orders) ? orders : [];
    subscriptions = Array.isArray(subscriptions) ? subscriptions : [];

    this.stats.totalUsers = users.length;

    const activeUserIds = new Set(subscriptions.filter(sub => sub.status === 'active' || sub.status === 'trialing').map(sub => sub.id));
    this.stats.activeUsers = activeUserIds.size;

    this.stats.totalProducts = products.length;
    this.stats.activeProducts = products.filter(product => product.available === true).length;

    this.stats.totalOrders = orders.length;
    this.stats.paidOrders = orders.filter(order => order.status === 'paid').length;
    this.stats.pendingOrders = orders.filter(order => order.status === 'pending').length;
    this.stats.cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

    this.stats.activeSubscriptions = subscriptions.filter(sub => sub.status === 'active' || sub.status === 'trialing').length;
    this.stats.trialSubscriptions = subscriptions.filter(sub => sub.status === 'trialing').length;

    this.stats.totalRevenue = subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + sub.price, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    this.stats.monthlyRevenue = subscriptions
      .filter(sub => sub.status === 'active')
      .filter(sub => {
        const start = new Date(sub.startDate);
        return start.getMonth() === currentMonth && start.getFullYear() === currentYear;
      })
      .reduce((sum, sub) => sum + sub.price, 0);
  }

  private prepareRecentOrders(orders: OrderWithUser[]): void {
    const ordersArray = Array.isArray(orders) ? orders : [];

    this.recentOrders = ordersArray
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 2)
      .map(order => ({
        id: order.id,
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        customerEmail: order.user.email,
        total: order.total,
        status: order.status,
        date: new Date(order.orderDate),
        productsCount: order.products.length
      }));
  }

  private prepareTopProductsFromAdmin(productsAdmin: ProductAdmin[]): void {
    const productsArray = Array.isArray(productsAdmin) ? productsAdmin : [];

    this.topProducts = productsArray
      .filter(product => (product.monthlyPurchaseAmount || 0) + (product.yearlyPurchaseAmount || 0) > 0)
      .map(product => {
        const totalSales = (product.monthlyPurchaseAmount || 0) + (product.yearlyPurchaseAmount || 0);
        const monthlyRevenue = (product.monthlyPurchaseAmount || 0) * product.monthlyPrice;
        const yearlyRevenue = (product.yearlyPurchaseAmount || 0) * product.yearlyPrice;
        const totalRevenue = monthlyRevenue + yearlyRevenue;

        return {
          id: product.id,
          name: product.name,
          category: product.category?.name || 'N/A',
          orderCount: totalSales,
          revenue: totalRevenue,
          monthlyCount: product.monthlyPurchaseAmount || 0,
          yearlyCount: product.yearlyPurchaseAmount || 0
        };
      })
      .sort((a, b) => {
        if (a.orderCount !== b.orderCount) {
          return b.orderCount - a.orderCount;
        }
        return b.revenue - a.revenue;
      })
      .slice(0, 2);
  }

  private prepareTopSubscriptions(subscriptions: Subscription[]): void {
    const subscriptionsArray = Array.isArray(subscriptions) ? subscriptions : [];

    const subscriptionGroups = new Map<string, { count: number; revenue: number, planType: string }>();

    subscriptionsArray
      .filter(sub => sub.status === 'active' || sub.status === 'trialing')
      .forEach(sub => {
        const current = subscriptionGroups.get(sub.name) || { count: 0, revenue: 0 };
        subscriptionGroups.set(sub.name, {
          count: current.count + 1,
          revenue: current.revenue + sub.price,
          planType: sub.planType || 'unknown'
        });
      });

    this.topSubscriptions = Array.from(subscriptionGroups.entries())
      .map(([name, data]) => ({
        id: name,
        name: name,
        count: data.count,
        revenue: data.revenue,
        planType: data.planType
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getStatCards(): StatCard[] {
    return [
      {
        title: 'Utilisateurs',
        value: this.stats.totalUsers,
        subValue: this.stats.activeUsers,
        subLabel: 'avec abonnement actif',
        icon: 'people',
        color: 'primary'
      },
      {
        title: 'Produits',
        value: this.stats.totalProducts,
        subValue: this.stats.activeProducts,
        subLabel: 'disponibles',
        icon: 'box',
        color: 'info'
      },
      {
        title: 'Commandes',
        value: this.stats.totalOrders,
        subValue: this.stats.paidOrders,
        subLabel: 'payées',
        icon: 'receipt',
        color: 'success'
      },
      {
        title: 'Abonnements',
        value: this.stats.activeSubscriptions,
        subValue: this.stats.trialSubscriptions,
        subLabel: 'en essai',
        icon: 'arrow-repeat',
        color: 'warning'
      },
      {
        title: 'Revenus totaux',
        value: this.stats.totalRevenue,
        subValue: this.stats.monthlyRevenue,
        subLabel: 'ce mois',
        icon: 'graph-up',
        color: 'success'
      },
      {
        title: 'Commandes en attente',
        value: this.stats.pendingOrders,
        subValue: this.stats.cancelledOrders,
        subLabel: 'annulées',
        icon: 'clock',
        color: 'warning'
      }
    ];
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-success';
      case 'pending':
        return 'bg-warning text-dark';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'Payée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getOrdersSuccessRate(): number {
    if (this.stats.totalOrders === 0) return 0;
    return Math.round((this.stats.paidOrders / this.stats.totalOrders) * 100);
  }

  getSubscriptionRecurringRevenue(): number {
    return this.topSubscriptions.reduce((sum, sub) => sum + sub.revenue, 0);
  }
}