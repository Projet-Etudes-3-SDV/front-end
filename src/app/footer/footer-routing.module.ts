import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FooterPage } from './footer.page';

const routes: Routes = [
  {
    path: '',
    component: FooterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FooterPageRoutingModule {}
