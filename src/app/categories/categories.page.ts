import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';

import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: false,
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query('ion-card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class CategoriesPage {
  categories: any[] = [];
  isDesktop: boolean = false;
  showCategories = false;

  constructor(public apiService: ApiService, private router: Router, private platform: Platform) {}

  ngOnInit() {
    this.isDesktop = this.platform.is('desktop');
  }

  ionViewWillEnter() {
    this.showCategories = false;
    setTimeout(() => {
      this.apiService.getAllCategories().then(response => {
        this.categories = response.data.result;
        this.showCategories = true;
      }).catch(error => {
        console.error(error);
      });
    }, 10);
  }

  navigateToCategory(categoryId: string) {
    this.router.navigate(['/categories/products', categoryId]);
  }
}
