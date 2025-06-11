import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProductsPage } from './products.page';

import { CardModule } from '@coreui/angular';

const routes: Routes = [
  {
    path: '',
    component: ProductsPage
  }
];

@NgModule({
  declarations: [ProductsPage],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CardModule
  ]
})
export class ProductsPageModule { }
