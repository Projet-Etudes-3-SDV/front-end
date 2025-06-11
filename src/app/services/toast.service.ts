import { Injectable } from '@angular/core';
import { ToastController, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(
    private toastController: ToastController,
    private platform: Platform
  ) {}

  /**
   * Affiche un toast avec les bons styles pour desktop/mobile
   *
   * @param message - Texte du toast
   * @param color - Couleur Ionic ('success' | 'danger' | 'warning' | 'info'...)
   * @param duration - Durée d'affichage (ms), par défaut 3000
   */
  async presentToast(message: string, color: string = 'success', duration: number = 3000) {
    const isDesktop = this.platform.is('desktop');

    const toast = await this.toastController.create({
      message,
      color,
      duration,
      position: 'top',
      swipeGesture: 'vertical',
      icon:
        color === 'warning'
          ? 'warning'
          : color === 'success'
          ? 'checkmark-circle'
          : color === 'info'
          ? 'information-circle'
          : 'close-circle',
      cssClass: isDesktop ? 'desktop-toast' : ''
    });

    await toast.present();
  }
}
