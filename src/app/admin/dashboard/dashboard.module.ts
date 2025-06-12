import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPage } from './dashboard.page';

import { CardModule, GridModule, SpinnerModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage
  }
];

@NgModule({
  declarations: [DashboardPage],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CardModule,
    GridModule,
    IconModule,
    SpinnerModule
  ]
})
export class DashboardPageModule { }
