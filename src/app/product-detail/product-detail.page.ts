import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: false
})
export class ProductDetailPage implements OnInit {
  product: any;
  productId: string = ''; // Initialize productId

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.productId = productId;
      this.apiService.getProductById(this.productId).then(response => {
        this.product = response.data;
      }).catch(error => {
        console.error(error);
      });
    } else {
      console.error('Product ID is null');
    }
  }
}
