import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  standalone: false
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  isDesktop: boolean = false;

  constructor(private apiService: ApiService, private router: Router, private platform: Platform) {}

  ngOnInit() {
    this.apiService.getAllCategories().then(response => {
      this.categories = response.data;
    }).catch(error => {
      console.error(error);
    });
    this.isDesktop = this.platform.is('desktop');
  }

  navigateToCategory(categoryId: string) {
    this.router.navigate(['/categories/products', categoryId]);
  }
}
