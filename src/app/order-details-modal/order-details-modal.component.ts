import { NgFor } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-order-details-modal',
  templateUrl: './order-details-modal.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    NgFor
  ],

})
export class OrderDetailsModalComponent {
  @Input() order: any;
  @Input()
  orderStatusMap!: Record<string, string>;

  constructor(private modalCtrl: ModalController) { }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
