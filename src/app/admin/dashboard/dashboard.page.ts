import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Order, OrderStatus } from '../../types/order.interface';
import { User, UserRole } from '../../types/user.interface';
import { Product } from '../../types/product.interface';
import { SubscriptionStatus } from '../../types/subscription.interface';

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

interface ApiResponse<T> {
  data: T[];
  total?: number;
}

interface Subscription {
  id: string;
  status: SubscriptionStatus;
  user: string;
  plan: string;
  startDate: Date;
  endDate?: Date;
}

interface OrderWithUser {
  id: string;
  total: number;
  status: OrderStatus;
  sessionId?: string;
  orderDate: Date;
  products: {
    product: string;
    plan: string;
  }[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
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
    status: OrderStatus;
    date: Date;
    productsCount: number;
  }[] = [];

  topProducts: {
    id: string;
    name: string;
    category: string;
    orderCount: number;
    revenue: number;
  }[] = [];

  isLoading = true;
  isLoadingOrders = true;
  isLoadingProducts = true;

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    await this.loadDashboardData();
  }

  public async loadDashboardData(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Charger toutes les données en parallèle
      const [
        usersResponse,
        productsResponse,
        ordersResponse,
        subscriptionsResponse
      ] = await Promise.all([
        this.apiService.get('/users') as Promise<ApiResponse<User>>,
        this.apiService.get('/products') as Promise<ApiResponse<Product>>,
        this.apiService.get('/orders') as Promise<ApiResponse<OrderWithUser>>,
        this.apiService.get('/subscriptions') as Promise<ApiResponse<Subscription>>
      ]);

      // Calculer les statistiques
      this.calculateStats(usersResponse.data, productsResponse.data, ordersResponse.data, subscriptionsResponse.data);
      
      // Préparer les données pour l'affichage
      this.prepareRecentOrders(ordersResponse.data);
      this.prepareTopProducts(ordersResponse.data, productsResponse.data);

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      this.isLoading = false;
      this.isLoadingOrders = false;
      this.isLoadingProducts = false;
    }
  }

  private calculateStats(users: User[], products: Product[], orders: OrderWithUser[], subscriptions: Subscription[]): void {
    // Statistiques utilisateurs
    this.stats.totalUsers = users.length;
    this.stats.activeUsers = users.filter(user => 
      user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    // Statistiques produits
    this.stats.totalProducts = products.length;
    this.stats.activeProducts = products.filter(product => product.active !== false && product.available).length;

    // Statistiques commandes
    this.stats.totalOrders = orders.length;
    this.stats.paidOrders = orders.filter(order => order.status === OrderStatus.PAID).length;
    this.stats.pendingOrders = orders.filter(order => order.status === OrderStatus.PENDING).length;
    this.stats.cancelledOrders = orders.filter(order => order.status === OrderStatus.CANCELLED).length;

    // Statistiques abonnements
    this.stats.activeSubscriptions = subscriptions.filter(sub => sub.status === SubscriptionStatus.ACTIVE).length;
    this.stats.trialSubscriptions = subscriptions.filter(sub => sub.status === SubscriptionStatus.TRIAL).length;

    // Revenus
    this.stats.totalRevenue = orders
      .filter(order => order.status === OrderStatus.PAID)
      .reduce((sum, order) => sum + order.total, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    this.stats.monthlyRevenue = orders
      .filter(order => {
        const orderDate = new Date(order.orderDate);
        return order.status === OrderStatus.PAID && 
               orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, order) => sum + order.total, 0);
  }

  private prepareRecentOrders(orders: OrderWithUser[]): void {
    this.recentOrders = orders
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 10)
      .map(order => ({
        id: order.id,
        customerName: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Client anonyme',
        customerEmail: order.user?.email || 'N/A',
        total: order.total,
        status: order.status,
        date: new Date(order.orderDate),
        productsCount: order.products.length
      }));
  }

  private prepareTopProducts(orders: OrderWithUser[], products: Product[]): void {
    // Compter les ventes par produit
    const productSales = new Map<string, { count: number; revenue: number }>();
    
    orders
      .filter(order => order.status === OrderStatus.PAID)
      .forEach(order => {
        order.products.forEach(item => {
          const current = productSales.get(item.product) || { count: 0, revenue: 0 };
          productSales.set(item.product, {
            count: current.count + 1,
            revenue: current.revenue + (order.total / order.products.length) // Approximation
          });
        });
      });

    // Créer la liste des top produits
    this.topProducts = Array.from(productSales.entries())
      .map(([productId, sales]) => {
        const product = products.find(p => p.id === productId);
        return {
          id: productId,
          name: product?.name || 'Produit inconnu',
          category: product?.category || 'N/A',
          orderCount: sales.count,
          revenue: sales.revenue
        };
      })
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);
  }

  getStatCards(): StatCard[] {
    return [
      {
        title: 'Utilisateurs',
        value: this.stats.totalUsers,
        subValue: this.stats.activeUsers,
        subLabel: 'actifs ce mois',
        icon: 'people-outline',
        color: 'primary'
      },
      {
        title: 'Produits',
        value: this.stats.totalProducts,
        subValue: this.stats.activeProducts,
        subLabel: 'disponibles',
        icon: 'cube-outline',
        color: 'info'
      },
      {
        title: 'Commandes',
        value: this.stats.totalOrders,
        subValue: this.stats.paidOrders,
        subLabel: 'payées',
        icon: 'receipt-outline',
        color: 'success'
      },
      {
        title: 'Abonnements',
        value: this.stats.activeSubscriptions,
        subValue: this.stats.trialSubscriptions,
        subLabel: 'en essai',
        icon: 'refresh-outline',
        color: 'warning'
      },
      {
        title: 'Revenus totaux',
        value: this.stats.totalRevenue,
        subValue: this.stats.monthlyRevenue,
        subLabel: 'ce mois',
        icon: 'trending-up-outline',
        color: 'success'
      },
      {
        title: 'Commandes en attente',
        value: this.stats.pendingOrders,
        subValue: this.stats.cancelledOrders,
        subLabel: 'annulées',
        icon: 'time-outline',
        color: 'warning'
      }
    ];
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PAID:
        return 'bg-success';
      case OrderStatus.PENDING:
        return 'bg-warning text-dark';
      case OrderStatus.CANCELLED:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PAID:
        return 'Payée';
      case OrderStatus.PENDING:
        return 'En attente';
      case OrderStatus.CANCELLED:
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
}