import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OrdersPage } from './orders.page';

import { CardModule } from '@coreui/angular';
import { FormsModule } from '@angular/forms';

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
    CardModule,
    FormsModule
  ]
})
export class OrdersPageModule { }
