import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LegalNoticePageRoutingModule } from './legal-notice-routing.module';

import { LegalNoticePage } from './legal-notice.page';
import { FooterModule } from '../footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LegalNoticePageRoutingModule,
    FooterModule
  ],
  declarations: [LegalNoticePage]
})
export class LegalNoticePageModule {}
