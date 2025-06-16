import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesPage } from './categories.page';

import { CardModule } from '@coreui/angular';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: CategoriesPage
  }
];

@NgModule({
  declarations: [CategoriesPage],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CardModule,
    FormsModule
  ]
})
export class CategoriesPageModule { }
