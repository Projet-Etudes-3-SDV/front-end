import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  standalone: false
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.apiService.getAllCategories().then(response => {
      this.categories = response.data;
    }).catch(error => {
      console.error(error);
    });
  }

  navigateToCategory(categoryId: string) {
    this.router.navigate(['/categories/products', categoryId]);
  }
}
