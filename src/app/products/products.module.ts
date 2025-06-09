import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsPage } from './products.page';

import { ProductsPageRoutingModule } from './products-routing.module';
import { FooterModule } from "../footer/footer.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ProductsPageRoutingModule,
    FooterModule
],
  declarations: [ProductsPage]
})
export class ProductsPageModule {}
