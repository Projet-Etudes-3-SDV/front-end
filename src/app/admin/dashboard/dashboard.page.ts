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
  result?: T[];
  data?: T[];
  total?: number;
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
  }[] = [];

  topSubscriptions: {
    id: string;
    name: string;
    count: number;
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
        this.apiService.get('/subscriptions')
      ]);

      // Récupérer les données depuis les réponses
      // Les APIs retournent response.data qui contient { result: [...], total: number }
      const usersData = (usersResponse as any).result || (usersResponse as any).data?.result || [];
      const productsData = (productsResponse as any).result || (productsResponse as any).data?.result || [];
      const ordersData = (ordersResponse as any).result || (ordersResponse as any).data?.result || [];
      // Les subscriptions sont retournées directement comme un tableau dans response.data
      const subscriptionsData = Array.isArray(subscriptionsResponse) ? subscriptionsResponse : 
                               Array.isArray((subscriptionsResponse as any).data) ? (subscriptionsResponse as any).data : 
                               (subscriptionsResponse as any).result || [];
      
      console.log('Users data:', usersData);
      console.log('Products data:', productsData);
      console.log('Orders data:', ordersData);
      console.log('Subscriptions data:', subscriptionsData);
      
      // Vérifier que nous avons bien des tableaux
      if (!Array.isArray(usersData)) console.error('Users data is not an array:', usersData);
      if (!Array.isArray(productsData)) console.error('Products data is not an array:', productsData);
      if (!Array.isArray(ordersData)) console.error('Orders data is not an array:', ordersData);
      if (!Array.isArray(subscriptionsData)) console.error('Subscriptions data is not an array:', subscriptionsData);
      
      // Calculer les statistiques
      this.calculateStats(usersData, productsData, ordersData, subscriptionsData);
      
      // Préparer les données pour l'affichage
      this.prepareRecentOrders(ordersData);
      this.prepareTopProducts(ordersData, productsData);
      this.prepareTopSubscriptions(subscriptionsData);

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      this.isLoading = false;
      this.isLoadingOrders = false;
      this.isLoadingProducts = false;
    }
  }

  private calculateStats(users: User[], products: Product[], orders: OrderWithUser[], subscriptions: Subscription[]): void {
    // S'assurer que les paramètres sont des tableaux
    users = Array.isArray(users) ? users : [];
    products = Array.isArray(products) ? products : [];
    orders = Array.isArray(orders) ? orders : [];
    subscriptions = Array.isArray(subscriptions) ? subscriptions : [];

    // Statistiques utilisateurs
    this.stats.totalUsers = users.length;
    
    // Compter les utilisateurs actifs (ceux qui ont une subscription active)
    const activeUserIds = new Set(subscriptions.filter(sub => sub.status === 'active').map(sub => sub.id));
    this.stats.activeUsers = activeUserIds.size;

    // Statistiques produits
    this.stats.totalProducts = products.length;
    this.stats.activeProducts = products.filter(product => product.available === true).length;

    // Statistiques commandes
    this.stats.totalOrders = orders.length;
    this.stats.paidOrders = orders.filter(order => order.status === 'paid').length;
    this.stats.pendingOrders = orders.filter(order => order.status === 'pending').length;
    this.stats.cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

    // Statistiques abonnements
    this.stats.activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
    this.stats.trialSubscriptions = subscriptions.filter(sub => sub.status === 'trial').length;

    // Revenus des commandes
    this.stats.totalRevenue = orders
      .filter(order => order.status === 'paid')
      .reduce((sum, order) => sum + order.total, 0);

    // Revenus mensuels des commandes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyOrderRevenue = orders
      .filter(order => {
        const orderDate = new Date(order.orderDate);
        return order.status === 'paid' && 
               orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, order) => sum + order.total, 0);

    // Ajouter les revenus des abonnements actifs pour le mois en cours
    const monthlySubscriptionRevenue = subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + sub.price, 0);

    this.stats.monthlyRevenue = monthlyOrderRevenue + monthlySubscriptionRevenue;
  }

  private prepareRecentOrders(orders: OrderWithUser[]): void {
    this.recentOrders = orders
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 10)
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

  private prepareTopProducts(orders: OrderWithUser[], products: Product[]): void {
    // Pour l'instant, utiliser les données disponibles
    // Note: Les produits dans les commandes n'ont pas de nom/catégorie
    // On pourrait faire une correspondance avec les IDs si nécessaire
    
    const productSales = new Map<string, { count: number; revenue: number }>();
    
    orders
      .filter(order => order.status === 'paid')
      .forEach(order => {
        order.products.forEach(item => {
          const productId = item.product.id;
          const current = productSales.get(productId) || { count: 0, revenue: 0 };
          productSales.set(productId, {
            count: current.count + 1,
            revenue: current.revenue + (order.total / order.products.length)
          });
        });
      });

    // Créer la liste des top produits
    this.topProducts = Array.from(productSales.entries())
      .map(([productId, sales]) => {
        const product = products.find(p => p.id === productId);
        let categoryName = 'N/A';
        
        if (product && product.category) {
          if (typeof product.category === 'object' && 'name' in product.category) {
            categoryName = product.category.name;
          } else if (typeof product.category === 'string') {
            categoryName = product.category;
          }
        }
        
        return {
          id: productId,
          name: product?.name || 'Produit supprimé',
          category: categoryName,
          orderCount: sales.count,
          revenue: sales.revenue
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  private prepareTopSubscriptions(subscriptions: Subscription[]): void {
    // Grouper les abonnements par nom de produit
    const subscriptionGroups = new Map<string, { count: number; revenue: number }>();
    
    subscriptions
      .filter(sub => sub.status === 'active')
      .forEach(sub => {
        const current = subscriptionGroups.get(sub.name) || { count: 0, revenue: 0 };
        subscriptionGroups.set(sub.name, {
          count: current.count + 1,
          revenue: current.revenue + sub.price
        });
      });

    // Créer la liste des top abonnements
    this.topSubscriptions = Array.from(subscriptionGroups.entries())
      .map(([name, data]) => ({
        id: name,
        name: name,
        count: data.count,
        revenue: data.revenue
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