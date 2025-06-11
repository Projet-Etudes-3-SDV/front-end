import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OrdersPage } from './orders.page';

import { CardModule } from '@coreui/angular';

const routes: Routes = [
  {
    path: '',
    component: OrdersPage
  }
];

@NgModule({
  declarations: [OrdersPage],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CardModule
  ]
})
export class OrdersPageModule { }
