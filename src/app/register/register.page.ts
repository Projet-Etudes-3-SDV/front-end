import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
  animations: [
    trigger('pageAnimation', [
      transition(':enter', [
        query('ion-item, ion-button, h3, .login-link', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(50, animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ])
  ]
})
export class RegisterPage {
  registerForm: FormGroup;
  isDesktop: boolean = false;
  showPassword = false;
  showForm: boolean = false;
  showPasswordVerification = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private fb: FormBuilder,
    private platform: Platform,
    private toastService: ToastService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,20}$')]],
      passwordVerification: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('passwordVerification')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  };

  ionViewWillEnter() {
    this.isDesktop = this.platform.is('desktop');
    this.showForm = false;
    setTimeout(() => this.showForm = true, 10);
  }

  async register() {
    if (this.registerForm.valid) {
      try {
        const response = await this.apiService.createUser(this.registerForm.value);
        if (response.data) {
          this.toastService.presentToast('Inscription réussie. Veuillez vérifier votre email.', 'success');
          this.router.navigate(['/login']);
        }
      } catch (error: any) {
        console.log(error);
        if (error.response?.data?.code === 'EMAIL_ALREADY_IN_USE') {
          this.toastService.presentToast('Email déjà utilisé.', 'danger');
        } else {
          this.toastService.presentToast('Échec de l\'inscription.', 'danger');
        }
      }
    } else {
      this.toastService.presentToast('Veuillez remplir tous les champs.', 'warning');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  togglePasswordVerificationVisibility() {
    this.showPasswordVerification = !this.showPasswordVerification;
  }
}
