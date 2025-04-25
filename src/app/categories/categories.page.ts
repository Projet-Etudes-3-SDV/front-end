import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: false,
})
export class CategoriesPage {
  categories: any[] = [];
  isDesktop: boolean = false;

  constructor(private apiService: ApiService, private router: Router, private platform: Platform) {}

  ngOnInit() {
    this.apiService.getAllCategories().then(response => {
      this.categories = response.data.result;
    }).catch(error => {
      console.error(error);
    });
    this.isDesktop = this.platform.is('desktop');
  }

  navigateToCategory(categoryId: string) {
    this.router.navigate(['/categories/products', categoryId]);
  }
}
