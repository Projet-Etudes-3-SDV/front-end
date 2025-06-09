import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductDetailPage } from './product-detail.page';

import { ProductDetailPageRoutingModule } from './product-detail-routing.module';
import { FooterModule } from "../footer/footer.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ProductDetailPageRoutingModule,
    FooterModule
],
  declarations: [ProductDetailPage]
})
export class ProductDetailPageModule {}
