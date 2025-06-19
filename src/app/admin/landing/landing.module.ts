import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LandingPage } from './landing.page';

import { FormsModule } from '@angular/forms';
import { CardModule } from '@coreui/angular';

const routes: Routes = [
  {
    path: '',
    component: LandingPage
  }
];

@NgModule({
  declarations: [LandingPage],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CardModule,
    FormsModule
  ]
})
export class LandingPageModule { }