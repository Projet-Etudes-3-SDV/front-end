import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AccountPage } from './account.page';
import { FooterModule } from '../footer/footer.module';

@NgModule({
  declarations: [AccountPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FooterModule,
    RouterModule.forChild([{ path: '', component: AccountPage }]),
  ],
})
export class AccountPageModule {}
