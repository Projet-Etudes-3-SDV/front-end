import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountPage } from './account.page';
import { AuthGuard } from '../services/auth.guard'; // ✅ Protection de la route

const routes: Routes = [
  {
    path: '',
    component: AccountPage,
    canActivate: [AuthGuard] // ✅ Empêche l'accès si l'utilisateur n'est pas connecté
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountPageRoutingModule {}
