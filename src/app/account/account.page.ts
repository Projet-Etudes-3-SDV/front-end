import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { NavController, Platform, AlertController, ModalController } from '@ionic/angular';
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
import { SubscriptionDetailsModalComponent } from '../subscription-details-modal/subscription-details-modal.component';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false,
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query('ion-list, .title-section, ion-label, ion-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(50, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class AccountPage {
  user: any = null;
  userSubscriptions: any[] = [];
  userOrders: any[] = [];
  isDesktop: boolean = false;
  showAccountContent: boolean = false;

  subscriptionStatusMap: { [key: string]: string } = {
    active: 'Actif',
    trialing: 'En essai',
    past_due: 'En retard',
    incomplete: 'Incomplet',
    canceled: 'Annulé',
    incomplete_expired: 'Incomplet expiré',
    unpaid: 'Non payé'
  };

  orderStatusMap: { [key: string]: string } = {
    paid: 'Payée',
    pending: 'En attente',
    failed: 'Échouée',
    cancelled: 'Annulée',
    processing: 'En cours'
  };

  // Pagination des abonnements
  subscriptionsPerPage = 5;
  currentPage = 1;

  // Pagination des commandes
  ordersPerPage = 5;
  currentOrderPage = 1;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private navCtrl: NavController,
    private toastService: ToastService,
    private platform: Platform,
    private alertController: AlertController,
    private modalCtrl: ModalController
    ) { }

  get paginatedSubscriptions() {
    const startIndex = (this.currentPage - 1) * this.subscriptionsPerPage;
    const endIndex = startIndex + this.subscriptionsPerPage;
    return this.userSubscriptions.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.userSubscriptions.length / this.subscriptionsPerPage);
  }

  get paginatedOrders() {
    const startIndex = (this.currentOrderPage - 1) * this.ordersPerPage;
    const endIndex = startIndex + this.ordersPerPage;
    return this.userOrders.slice(startIndex, endIndex);
  }

  get totalOrderPages(): number {
    return Math.ceil(this.userOrders.length / this.ordersPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToOrderPage(page: number) {
    if (page >= 1 && page <= this.totalOrderPages) {
      this.currentOrderPage = page;
    }
  }

  async ionViewWillEnter() {
    this.isDesktop = this.platform.is('desktop');
    this.showAccountContent = false;

    setTimeout(async () => {
      try {
        const response = await this.apiService.getMe();
        this.user = response.data;
        this.userSubscriptions = this.user.subscriptions || [];

        await this.loadUserOrders();

        this.showAccountContent = true;
      } catch (error) {
        console.error('Erreur lors du chargement des infos utilisateur:', error);
      }
    }, 10);
  }

  async loadUserOrders() {
    try {
      const ordersResponse = await this.apiService.getUserOrders();
      this.userOrders = ordersResponse.data.result || [];

      this.userOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      this.userOrders = [];
    }
  }

  async viewOrderDetails(order: any) {
    const modal = await this.modalCtrl.create({
      component: OrderDetailsModalComponent,
      componentProps: {
        order,
        orderStatusMap: this.orderStatusMap
      },
    });

    await modal.present();
  }

  private buildOrderDetailsMessage(order: any): string {
    const formattedDate = new Date(order.orderDate).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let productsText = '';
    order.products.forEach((orderProduct: any, index: number) => {
      productsText += `${index + 1}. ${orderProduct.product.name}\n`;
      productsText += `   Catégorie: ${orderProduct.product.category.name}\n`;
      productsText += `   Plan: ${orderProduct.plan === 'monthly' ? 'Mensuel' : 'Annuel'}\n`;
      if (orderProduct.product.description) {
        productsText += `   Description: ${orderProduct.product.description.substring(0, 100)}${orderProduct.product.description.length > 100 ? '...' : ''}\n`;
      }
      productsText += '\n';
    });

    return `Date: ${formattedDate}

Statut: ${this.orderStatusMap[order.status]}

Total: ${order.total.toFixed(2)} €

Produits commandés:

${productsText}`;
  }

  logout() {
    this.authService.logout();
    this.toastService.presentToast('Vous êtes bien déconnecté !', 'success');
    this.navCtrl.navigateRoot('/login');
  }

  public getActiveSubscriptionCount(): number {
    return this.userSubscriptions.filter(sub => sub.status === 'active').length;
  }

  async addAddress() {
    const alert = await this.alertController.create({
      header: 'Ajouter une adresse',
      inputs: [
        {
          name: 'street',
          type: 'text',
          placeholder: 'Rue'
        },
        {
          name: 'postalCode',
          type: 'text',
          placeholder: 'Code postal'
        },
        {
          name: 'city',
          type: 'text',
          placeholder: 'Ville'
        },
        {
          name: 'country',
          type: 'text',
          placeholder: 'Pays',
          value: 'France'
        },
        {
          name: 'phone',
          type: 'tel',
          placeholder: 'Téléphone (optionnel)'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Ajouter',
          handler: async (data) => {
            if (!data.street || !data.postalCode || !data.city || !data.country) {
              this.toastService.presentToast('Veuillez remplir tous les champs obligatoires.', 'warning');
              return false;
            }
            await this.saveNewAddress(data);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private async saveNewAddress(addressData: any) {
    try {
      const newAddress = {
        street: addressData.street,
        postalCode: addressData.postalCode,
        city: addressData.city,
        country: addressData.country,
        phone: addressData.phone || ''
      };

      if (!this.user.addresses) {
        this.user.addresses = [];
      }
      this.user.addresses.push(newAddress);

      await this.apiService.addUserAddress(newAddress);

      this.toastService.presentToast('Adresse ajoutée avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'adresse:', error);
      this.toastService.presentToast('Erreur lors de l\'ajout de l\'adresse.', 'danger');
    }
  }

  async editAddress(index: number) {
    const address = this.user.addresses[index];

    const alert = await this.alertController.create({
      header: 'Modifier l\'adresse',
      inputs: [
        {
          name: 'street',
          type: 'text',
          placeholder: 'Rue',
          value: address.street
        },
        {
          name: 'postalCode',
          type: 'text',
          placeholder: 'Code postal',
          value: address.postalCode
        },
        {
          name: 'city',
          type: 'text',
          placeholder: 'Ville',
          value: address.city
        },
        {
          name: 'country',
          type: 'text',
          placeholder: 'Pays',
          value: address.country
        },
        {
          name: 'phone',
          type: 'tel',
          placeholder: 'Téléphone (optionnel)',
          value: address.phone || ''
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          cssClass: 'danger',
          handler: async () => {
            await this.deleteAddress(index);
          }
        },
        {
          text: 'Modifier',
          handler: async (data) => {
            if (!data.street || !data.postalCode || !data.city || !data.country) {
              this.toastService.presentToast('Veuillez remplir tous les champs obligatoires.', 'warning');
              return false;
            }
            await this.updateAddress(index, data);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private async updateAddress(index: number, addressData: any) {
    try {
      const updatedAddress = {
        street: addressData.street,
        postalCode: addressData.postalCode,
        city: addressData.city,
        country: addressData.country,
        phone: addressData.phone || ''
      };

      this.user.addresses[index] = updatedAddress;

      await this.apiService.updateAddress(index, updatedAddress);

      this.toastService.presentToast('Adresse modifiée avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la modification de l\'adresse:', error);
      this.toastService.presentToast('Erreur lors de la modification de l\'adresse.', 'danger');
    }
  }

  private async deleteAddress(index: number) {
    const confirmAlert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette adresse ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          cssClass: 'danger',
          handler: async () => {
            try {
              this.user.addresses.splice(index, 1);

              await this.apiService.deleteUserAddress(index);

              this.toastService.presentToast('Adresse supprimée avec succès !', 'success');
            } catch (error) {
              console.error('Erreur lors de la suppression de l\'adresse:', error);
              this.toastService.presentToast('Erreur lors de la suppression de l\'adresse.', 'danger');
            }
          }
        }
      ]
    });

    await confirmAlert.present();
  }

  async sendInvoiceMail(subscriptionId: string) {
    try {
      await this.apiService.sendInvoiceMail(subscriptionId);
      this.toastService.presentToast('L\'email de facture a été envoyé avec succès.', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de facture:', error);
      this.toastService.presentToast('Erreur lors de l\'envoi de l\'email de facture.', 'danger');
    }
  }

  async cancelSubscription(subscriptionId: string) {
    const confirmAlert = await this.alertController.create({
      header: 'Confirmer l\'annulation',
      message: 'Êtes-vous sûr de vouloir annuler cette souscription ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Annuler la souscription',
          cssClass: 'danger',
          handler: async () => {
            try {
              await this.apiService.cancelSubscription(subscriptionId);
              this.toastService.presentToast('La souscription a été annulée avec succès.', 'success');

              this.userSubscriptions.find(sub => sub.id === subscriptionId).cancelAtPeriodEnd = true;
            } catch (error) {
              console.error('Erreur lors de l\'annulation de la souscription:', error);
              this.toastService.presentToast('Erreur lors de l\'annulation de la souscription.', 'danger');
            }
          }
        }
      ] 
    });
    await confirmAlert.present();
  }

  async viewSubscriptionDetails(subscription: any) {
    const modal = await this.modalCtrl.create({
      component: SubscriptionDetailsModalComponent,
      componentProps: {
        subscription,
        subscriptionStatusMap: this.subscriptionStatusMap
      },
      cssClass: 'subscription-details-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data && data.action === 'sendInvoice') {
      await this.sendInvoiceMail(data.subscriptionId);
    } else if (data && data.action === 'cancelSubscription') {
      await this.cancelSubscription(subscription.id);
    }
  }
}