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

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false,
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query('ion-list, .title-section, ion-label', [
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

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private navCtrl: NavController,
    private toastService: ToastService,
    private platform: Platform,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  async ionViewWillEnter() {
    this.isDesktop = this.platform.is('desktop');
    this.showAccountContent = false;

    setTimeout(async () => {
      try {
        const response = await this.apiService.getMe();
        this.user = response.data;
        this.userSubscriptions = this.user.subscriptions || [];
        this.showAccountContent = true;
      } catch (error) {
        console.error('Erreur lors du chargement des infos utilisateur:', error);
      }
    }, 10);
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
}