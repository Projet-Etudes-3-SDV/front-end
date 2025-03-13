import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountValidationPage } from './account-validation.page';

const routes: Routes = [
  {
    path: '',
    component: AccountValidationPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValidateAccountPageRoutingModule {}
