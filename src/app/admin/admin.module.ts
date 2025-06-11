import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './layout/admin-layout.component';

import {
  SidebarModule,
  HeaderModule,
  NavModule,
  CardModule,
  ButtonModule,
  TableModule
} from '@coreui/angular';

@NgModule({
  declarations: [AdminLayoutComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SidebarModule,
    HeaderModule,
    NavModule,
    CardModule,
    ButtonModule,
    TableModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule {}
