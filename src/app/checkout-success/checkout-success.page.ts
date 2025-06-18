import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { NavController, Platform, ModalController } from '@ionic/angular';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';
import { ToastService } from '../services/toast.service';
import { OrderDetailsModalComponent } from '../order-details-modal/order-details-modal.component';

@Component({
  selector: 'app-checkout-success',
  templateUrl: './checkout-success.page.html',
  styleUrls: ['./checkout-success.page.scss'],
  standalone: false,
  animations: [
    trigger('slideInAnimation', [
      transition(':enter', [
        query('.success-container, .order-card, .order-summary', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ],
})
export class CheckoutSuccessPage implements OnInit {
  orderId: string = '';
  order: any = null;
  isLoading: boolean = true;
  isDesktop: boolean = false;
  showContent: boolean = false;

  orderStatusMap: { [key: string]: string } = {
    paid: 'Payée',
    pending: 'En attente',
    failed: 'Échouée',
    cancelled: 'Annulée',
    processing: 'En cours'
  };

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private navCtrl: NavController,
    private toastService: ToastService,
    private platform: Platform,
    private modalCtrl: ModalController,
    private router: Router
  ) { }

  ngOnInit() {
    this.isDesktop = this.platform.is('desktop');

    // Récupérer l'ID de la commande depuis l'URL
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      if (this.orderId) {
        this.loadOrderDetails();
      } else {
        this.toastService.presentToast('ID de commande manquant', 'danger');
        this.navCtrl.navigateRoot('/tabs/account');
      }
    });
  }

  async loadOrderDetails() {
    try {
      this.isLoading = true;
      const response = await this.apiService.getUserOrderById(this.orderId);

      if (response && response.data) {
        this.order = response.data;
        setTimeout(() => {
          this.showContent = true;
          this.isLoading = false;
        }, 300);
      } else {
        throw new Error('Commande non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la commande:', error);
      this.isLoading = false;
      this.toastService.presentToast('Erreur lors du chargement de la commande', 'danger');
      this.navCtrl.navigateRoot('/tabs/account');
    }
  }

  async viewFullOrderDetails() {
    if (!this.order) return;

    const modal = await this.modalCtrl.create({
      component: OrderDetailsModalComponent,
      componentProps: {
        order: this.order,
        orderStatusMap: this.orderStatusMap
      },
    });

    await modal.present();
  }

  goToAccount() {
    this.router.navigate(['/account']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'success';
      case 'processing':
        return 'warning';
      case 'pending':
        return 'medium';
      case 'failed':
      case 'cancelled':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getTotalProducts(): number {
    return this.order?.products?.length || 0;
  }

  isOrderSuccessful(): boolean {
    return this.order?.status === 'paid' || this.order?.status === 'processing';
  }
}