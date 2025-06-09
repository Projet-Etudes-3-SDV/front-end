import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResetPasswordPage } from './reset-password.page';

import { ResetPasswordPageRoutingModule } from './reset-password-routing.module';
import { FooterModule } from "../footer/footer.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ResetPasswordPageRoutingModule,
    FooterModule
],
  declarations: [ResetPasswordPage]
})
export class ResetPasswordPageModule {}
