import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-account-validation',
  templateUrl: './account-validation.page.html',
  styleUrls: ['./account-validation.page.scss'],
  standalone: false
})
export class AccountValidationPage implements OnInit {
  token: string = '';

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (this.token) {
      this.validateAccount();
    } else {
      this.presentToast('Token invalide.', 'danger');
    }
  }

  async validateAccount() {
    console.log(this.token)
    try {
      const response = await this.apiService.validateUserAccount({ authToken: this.token });
      if (response.data) {
        this.presentToast('Votre compte a été activé avec succès.', 'success');
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
      console.log(error);
      if (error.response.data.code === 'ACCOUNT_ALREADY_VALIDATED') {
        this.presentToast('Compte déjà validé.', 'warning');
      } else {
        this.presentToast('La vérification de votre compte a échoué. Merci de réessayer.', 'danger');
      }
      this.router.navigate(['/home']);
    }
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
