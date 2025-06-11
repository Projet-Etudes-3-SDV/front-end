import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UsersPage } from './users.page';

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
    CardModule
  ]
})
export class UsersPageModule { }
