import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-subscription-details-modal',
  templateUrl: './subscription-details-modal.component.html',
  styleUrls: ['./subscription-details-modal.component.scss'],
  standalone: false,
})
export class SubscriptionDetailsModalComponent {
  @Input() subscription: any;
  @Input() subscriptionStatusMap: { [key: string]: string } = {};

  
  constructor(private modalCtrl: ModalController) { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  sendInvoice() {
    this.modalCtrl.dismiss({ action: 'sendInvoice', subscriptionId: this.subscription.id });
  }

  cancelSubscription() {
    this.modalCtrl.dismiss({ action: 'cancelSubscription', subscriptionId: this.subscription.id });
  }
}

@NgModule({
  declarations: [SubscriptionDetailsModalComponent],
  imports: [
    CommonModule,
    IonicModule
  ]
})

export class SubscriptionDetailsModalModule { }