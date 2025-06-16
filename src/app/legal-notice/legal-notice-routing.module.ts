import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LegalNoticePage } from './legal-notice.page';

const routes: Routes = [
  {
    path: '',
    component: LegalNoticePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LegalNoticePageRoutingModule {}
