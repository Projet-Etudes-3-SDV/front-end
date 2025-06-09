import { Injectable } from '@angular/core';
import axios from 'axios';

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
  private readonly PRODUCT_API = 'http://localhost:3000/api/products';
  private readonly CATEGORY_API = 'http://localhost:3000/api/categories';

  constructor() {}

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
