import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UsersPage } from './users.page';
import { FormsModule } from '@angular/forms';

import { CardModule } from '@coreui/angular';

const routes: Routes = [
  {
    path: '',
    component: UsersPage
  }
];

@NgModule({
  declarations: [UsersPage],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CardModule,
    FormsModule
  ]
})
export class UsersPageModule { }
