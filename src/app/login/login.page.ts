import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { AxiosError } from 'axios';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private navCtrl: NavController,
    private toastController: ToastController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async login() {
    if (this.loginForm.valid) {
      try {
        await this.authService.login(this.loginForm.value);
        this.presentToast('Vous êtes bien connecté !', 'success');
        this.navCtrl.navigateRoot('/account');
      } catch (error: unknown) {
        const axiosError = error as AxiosError;
        const errorData = axiosError.response?.data as { code?: string };
        console.error('Erreur de connexion:', errorData || axiosError.message);

        if (errorData?.code === 'NO_USER_FOUND') {
          this.presentToast('Utilisateur non trouvé. Vérifiez vos identifiants.', 'danger');
        } else if (errorData?.code === 'ACCOUNT_NOT_VALIDATED') {
          this.presentToast('Compte non validé. Vérifiez votre email.', 'warning');
        } else if (errorData?.code === 'INVALID_CREDENTIALS') {
          this.presentToast('Identifiants invalides. Veuillez réessayer.', 'danger');
        } else {
          this.presentToast('Échec de connexion. Veuillez réessayer plus tard.', 'danger');
        }
      }
    } else {
      this.presentToast('Veuillez remplir tous les champs.', 'warning');
    }
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
