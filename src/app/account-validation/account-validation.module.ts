import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountValidationPage } from './account-validation.page';

import { ValidateAccountPageRoutingModule } from './account-validation-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ValidateAccountPageRoutingModule
  ],
  declarations: [AccountValidationPage]
})
export class ValidateAccountPageModule {}
