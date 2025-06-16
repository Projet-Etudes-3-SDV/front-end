import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../services/auth.guard';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadChildren: () => import('../home/home.module').then(m => m.HomePageModule) },
      { path: 'categories', loadChildren: () => import('../categories/categories.module').then(m => m.CategoriesPageModule) },
      { path: 'account', loadChildren: () => import('../account/account.module').then(m => m.AccountPageModule), canActivate: [AuthGuard] },
      { path: 'search', loadChildren: () => import('../search/search.module').then(m => m.SearchPageModule) },
      { path: 'login', loadChildren: () => import('../login/login.module').then(m => m.LoginPageModule) },
      { path: 'register', loadChildren: () => import('../register/register.module').then(m => m.RegisterPageModule) },
      { path: 'forgot-password', loadChildren: () => import('../forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule) },
      { path: 'categories/products/:categoryId', loadChildren: () => import('../products/products.module').then(m => m.ProductsPageModule) },
      { path: 'categories/product/:productId', loadChildren: () => import('../product-detail/product-detail.module').then(m => m.ProductDetailPageModule) },
      { path: 'legal-notice', loadChildren: () => import('../legal-notice/legal-notice.module').then(m => m.LegalNoticePageModule) },
      { path: 'cgu', loadChildren: () => import('../cgu/cgu.module').then(m => m.CguPageModule) },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
