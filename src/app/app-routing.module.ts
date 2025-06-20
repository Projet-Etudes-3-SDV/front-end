import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './services/admin.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AdminGuard] // Protection au niveau du module admin
  },
  {
    path: 'account-validation/:token',
    loadChildren: () => import('./account-validation/account-validation.module').then(m => m.ValidateAccountPageModule)
  },
  {
    path: 'reset-password/:token',
    loadChildren: () => import('./reset-password/reset-password.module').then(m => m.ResetPasswordPageModule)
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
  {
    path: 'legal-notice',
    loadChildren: () => import('./legal-notice/legal-notice.module').then( m => m.LegalNoticePageModule)
  },
  {
    path: 'cgu',
    loadChildren: () => import('./cgu/cgu.module').then( m => m.CguPageModule)
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyPageModule)
  },
  {
    path: 'checkout-success',
    loadChildren: () => import('./checkout-success/checkout-success.module').then( m => m.CheckoutSuccessPageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
