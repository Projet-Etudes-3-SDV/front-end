import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false,
  animations: [
    trigger('pageAnimation', [
      transition(':enter', [
        query('ion-item, ion-button, h3', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ])
  ]
})
export class ForgotPasswordPage {
  form: FormGroup;
  isDesktop = false;
  showForm = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private platform: Platform,
    private router: Router,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ionViewWillEnter() {
    this.isDesktop = this.platform.is('desktop');
    this.showForm = false;
    setTimeout(() => this.showForm = true, 10);
  }

  async submit() {
    if (this.form.invalid) {
      this.toastService.presentToast('Veuillez entrer un email valide.', 'warning');
      return;
    }

    try {
      await this.authService.requestPasswordReset(this.form.value.email);
      this.toastService.presentToast('Un lien de réinitialisation a été envoyé.', 'success');
      this.router.navigate(['/login']);
    } catch {
      this.toastService.presentToast('Erreur lors de l\'envoi. Vérifiez l\'email.', 'danger');
    }
  }
}