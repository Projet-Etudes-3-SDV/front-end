import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../services/auth.guard';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'home', loadChildren: () => import('../home/home.module').then(m => m.HomePageModule) },
      { path: 'categories', loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule) },
      { path: 'account', loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule), canActivate: [AuthGuard] },
      { path: 'search', loadChildren: () => import('../tab4/tab4.module').then(m => m.Tab4PageModule) },
      { path: 'login', loadChildren: () => import('../login/login.module').then(m => m.LoginPageModule) },
      { path: 'register', loadChildren: () => import('../register/register.module').then(m => m.RegisterPageModule) },
      { path: 'categories/products/:categoryId', loadChildren: () => import('../products/products.module').then(m => m.ProductsPageModule) },
      { path: 'categories/product/:productId', loadChildren: () => import('../product-detail/product-detail.module').then(m => m.ProductDetailPageModule) },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
