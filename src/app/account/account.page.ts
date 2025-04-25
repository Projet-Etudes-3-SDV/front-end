import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { NavController, ToastController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false,
})
export class AccountPage {
  user: any = null;
  userSubscriptions: any[] = [];
  isDesktop: boolean = false;

  constructor(private authService: AuthService, private apiService: ApiService, private navCtrl: NavController, private toastController: ToastController, private platform: Platform) {}

  async ionViewWillEnter() {
    try {
      const response = await this.apiService.get('/users/me');
      this.user = response.data;
      this.userSubscriptions = this.user.subscriptions || [];
    } catch (error) {
      console.error('Erreur lors du chargement des infos utilisateur:', error);
    }
    this.isDesktop = this.platform.is('desktop');
  }

  logout() {
    this.authService.logout();
    this.presentToast('Vous êtes bien déconnecté !', 'success');
    this.navCtrl.navigateRoot('/login');
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 4000,
      position: 'top',
      swipeGesture: 'vertical'
    });
    toast.present();
  }
}
