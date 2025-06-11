import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { AxiosError } from 'axios';
import {
  trigger, transition, style, animate, query, stagger
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
  codeForm: FormGroup;
  isDesktop = false;
  showPassword = false;
  showForm = false;
  requireCode = false;
  obfuscatedEmail = '';

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

    this.codeForm = this.fb.group({
      code: ['', [Validators.required]]
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

        if (axiosError.response?.status === 200 && errorData?.code === 'VERIFY_CODE') {
          this.requireCode = true;
          const email = this.loginForm.value.email;
          this.obfuscatedEmail = this.obfuscateEmail(email);
          this.toastService.presentToast(
            `Un code de vérification a été envoyé à ${this.obfuscatedEmail}. Veuillez le saisir pour continuer.`,
            'info'
          );
        } else if (errorData?.code === 'NO_USER_FOUND') {
          this.toastService.presentToast('Utilisateur non trouvé.', 'danger');
        } else {
          this.toastService.presentToast('Erreur de connexion.', 'danger');
        }
      }
    } else {
      this.toastService.presentToast('Veuillez remplir tous les champs.', 'warning');
    }
  }

  async validateCode() {
    if (this.codeForm.valid && this.loginForm.valid) {
      try {
        await this.authService.validateLoginCode({
          email: this.loginForm.value.email,
          authCode: this.codeForm.value.code
        });
        this.toastService.presentToast('Connexion validée !', 'success');
        this.cancelCodeVerification();
      } catch (error: any) {
        if(error.response?.status === 400 && error.response.data.code === 'USER_CODE_INVALID') {
          this.toastService.presentToast('Code de vérification invalide. Veuillez réessayer.', 'danger');
        } else if(error.response?.status === 400 && error.response.data.code === 'USER_CODE_EXPIRED') {
          this.toastService.presentToast('Code de vérification expiré. Veuillez demander un nouveau code.', 'danger');
        } else {
          this.toastService.presentToast('Erreur lors de la validation du code.', 'danger');
        }
      }
    }
  }

  cancelCodeVerification() {
    this.requireCode = false;
    this.codeForm.reset();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private obfuscateEmail(email: string): string {
    const [local, domain] = email.split('@');
    const obfuscatedLocal = local.slice(0, 4) + '*'.repeat(Math.max(0, local.length - 4));
    return `${obfuscatedLocal}@${domain}`;
  }
}
