import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: false
})
export class ProductsPage implements OnInit {
  products: any[] = [];
  categoryId: string = '';
  isDesktop: boolean = false;

  constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router, private navCtrl: NavController, private platform: Platform) {}

  ngOnInit() {
    const categoryId = this.route.snapshot.paramMap.get('categoryId');
    if (categoryId) {
      this.categoryId = categoryId;
      this.apiService.getProductsByCategory(this.categoryId).then(response => {
        this.products = response.data;
      }).catch(error => {
        console.error(error);
      });
    } else {
      console.error('Category ID is null');
    }
    this.isDesktop = this.platform.is('desktop');
  }

  navigateToProduct(productId: string) {
    this.navCtrl.navigateForward(['/categories/product', productId]);

  }
}
