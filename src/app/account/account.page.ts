import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false,
})
export class AccountPage implements OnInit {
  user: any = null;
  userSubscriptions: any[] = [];

  constructor(private authService: AuthService, private apiService: ApiService, private navCtrl: NavController, private toastController: ToastController) {}

  async ngOnInit() {
    try {
      const response = await this.apiService.get('/users/me');
      this.user = response.data;
      this.userSubscriptions = this.user.subscriptions || [];
    } catch (error) {
      console.error('Erreur lors du chargement des infos utilisateur:', error);
    }
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
      position: 'top'
    });
    toast.present();
  }
}
