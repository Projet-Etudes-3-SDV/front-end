import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { AxiosError } from 'axios';
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
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
  animations: [
    trigger('pageAnimation', [
      transition(':enter', [
        query('ion-item, ion-button, h3, .forgot-pwd, .register-link', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(50, animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ])
  ]
})
export class LoginPage {
  loginForm: FormGroup;
  errorMessage: string = '';
  isDesktop: boolean = false;
  showPassword = false;
  showForm: boolean = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private platform: Platform,
    private toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ionViewWillEnter() {
    this.isDesktop = this.platform.is('desktop');
    this.showForm = false;
    setTimeout(() => this.showForm = true, 10);
  }

  async login() {
    if (this.loginForm.valid) {
      try {
        await this.authService.login(this.loginForm.value);
        this.toastService.presentToast('Vous êtes bien connecté !', 'success');
      } catch (error: unknown) {
        const axiosError = error as AxiosError;
        const errorData = axiosError.response?.data as { code?: string };
        console.error('Erreur de connexion:', errorData || axiosError.message);

        if (errorData?.code === 'NO_USER_FOUND') {
          this.toastService.presentToast('Utilisateur non trouvé. Vérifiez vos identifiants.', 'danger');
        } else if (errorData?.code === 'ACCOUNT_NOT_VALIDATED') {
          this.toastService.presentToast('Compte non validé. Vérifiez votre email.', 'warning');
        } else if (errorData?.code === 'INVALID_CREDENTIALS') {
          this.toastService.presentToast('Identifiants invalides. Veuillez réessayer.', 'danger');
        } else {
          this.toastService.presentToast('Échec de connexion. Veuillez réessayer plus tard.', 'danger');
        }
      }
    } else {
      this.toastService.presentToast('Veuillez remplir tous les champs.', 'warning');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
