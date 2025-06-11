import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { NavController, Platform } from '@ionic/angular';
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
    private platform: Platform
  ) {}

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
}
