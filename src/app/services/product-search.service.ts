import { Injectable } from '@angular/core';
import axios from 'axios';
import { ApiService } from './api.service';

export interface SearchProductCriteria {
  id?: string;
  name?: string;
  available?: boolean;
  monthlyPrice?: number;
  yearlyPrice?: number;
  category?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductSearchService {
  private readonly PRODUCT_API: string;
  private readonly CATEGORY_API: string;

  constructor(private apiService: ApiService) {
    this.PRODUCT_API = `${this.apiService.baseUrl}/products`;
    this.CATEGORY_API = `${this.apiService.baseUrl}/categories`;
  }

  async search(criteria: SearchProductCriteria, filter: 'products' | 'categories'): Promise<{
    products: any[];
    categories: any[];
    total: number;
  }> {
    const params = new URLSearchParams();

    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    try {
      if (filter === 'products') {
        const response = await axios.get(this.PRODUCT_API, { params });
        return {
          products: response.data.result || [],
          categories: [],
          total: response.data.total || 0
        };
      } else {
        const response = await axios.get(this.CATEGORY_API, { params });
        return {
          products: [],
          categories: response.data.result || [],
          total: response.data.total || 0
        };
      }
    } catch (error) {
      console.error('Erreur lors de la recherche :', error);
      return { products: [], categories: [], total: 0 };
    }
  }
}
