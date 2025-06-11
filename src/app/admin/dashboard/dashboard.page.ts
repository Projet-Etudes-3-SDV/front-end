import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  stats = {
    users: null,
    products: null,
    orders: null,
    subscriptions: null,
    coupons: null,
    landings: null,
  };  

  lastOrders = [
    { id: 'CMD123', client: 'Alice Dupont', total: 89.99, date: new Date(), status: 'paid' },
    { id: 'CMD124', client: 'Bob Martin', total: 129.50, date: new Date(), status: 'pending' },
    { id: 'CMD125', client: 'Claire Dubois', total: 56.40, date: new Date(), status: 'cancelled' }
  ];

  constructor(private apiService: ApiService) { }

  async ngOnInit() {
    const [users, products, orders, subscriptions, coupons, landings] = await Promise.all([
      this.apiService.get('/users'),
      this.apiService.get('/products'),
      this.apiService.get('/orders'),
      this.apiService.get('/subscriptions'),
      this.apiService.get('/coupons'),
      this.apiService.get('/landings'),
    ]);

    this.stats.users = (users?.data as any)?.total || 0;
    this.stats.products = (products?.data as any)?.total || 0;
    this.stats.orders = (orders?.data as any)?.total || 0;
    this.stats.subscriptions = (subscriptions?.data as any)?.map((item: { status: string }) => item.status === 'active').length || 0;
    this.stats.coupons = (coupons?.data as any)?.total || 0;
    this.stats.landings = (landings?.data as any)?.total || 0;
  }

  statList() {
    return [
      { label: 'Utilisateurs', value: this.stats.users },
      { label: 'Produits', value: this.stats.products },
      { label: 'Commandes', value: this.stats.orders },
      { label: 'Abonnements actifs', value: this.stats.subscriptions },
      { label: 'Coupons', value: this.stats.coupons },
      { label: 'Landings', value: this.stats.landings },
    ];
  }

  getColor(index: number): string {
    const colors = ['primary', 'info', 'warning', 'danger', 'success', 'secondary', 'dark'];
    return colors[index % colors.length];
  }


}
