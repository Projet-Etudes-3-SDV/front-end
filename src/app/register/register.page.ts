import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { ToastController, Platform } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isDesktop: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastController: ToastController,
    private fb: FormBuilder,
    private platform: Platform
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.isDesktop = this.platform.is('desktop');
  }

  async register() {
    if (this.registerForm.valid) {
      try {
        const response = await this.apiService.createUser(this.registerForm.value);
        if (response.data) {
          this.presentToast('Inscription réussie. Veuillez vérifier votre email.', 'success');
          this.router.navigate(['/login']);
        }
      } catch (error: any) {
        console.log(error);
        if (error.response?.data?.code === 'EMAIL_ALREADY_IN_USE') {
          this.presentToast('Email déjà utilisé.', 'danger');
        } else {
          this.presentToast('Échec de l\'inscription.', 'danger');
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
