import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Platform } from '@ionic/angular';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
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
export class ResetPasswordPage {
  form: FormGroup;
  token: string = '';
  isDesktop = false;
  showForm = false;
  showPassword = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private platform: Platform,
    private router: Router,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ionViewWillEnter() {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    this.isDesktop = this.platform.is('desktop');
    this.showForm = false;
    setTimeout(() => this.showForm = true, 10);
  }

  async submit() {
    if (this.form.invalid || !this.token) {
      this.toastService.presentToast('Mot de passe invalide.', 'warning');
      return;
    }

    try {
      await this.authService.resetPassword(this.token, this.form.value.newPassword);
      this.toastService.presentToast('Mot de passe mis à jour. Vous pouvez vous connecter.', 'success');
      this.router.navigate(['/login']);
    } catch {
      this.toastService.presentToast('Lien invalide ou expiré.', 'danger');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
