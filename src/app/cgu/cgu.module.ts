import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CguPageRoutingModule } from './cgu-routing.module';

import { CguPage } from './cgu.page';
import { FooterModule } from '../footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CguPageRoutingModule,
    FooterModule
  ],
  declarations: [CguPage]
})
export class CguPageModule {}
