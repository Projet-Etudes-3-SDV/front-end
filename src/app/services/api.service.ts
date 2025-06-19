import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private axiosInstance: AxiosInstance;

  constructor(private cookieService: CookieService, private platform: Platform) {
    this.axiosInstance = axios.create({
      baseURL: this.platform.is('cordova') || this.platform.is('capacitor') ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.axiosInstance.interceptors.request.use(config => {
      const token = localStorage.getItem('auth_token') ?? '';
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, error => {
      return Promise.reject(error);
    });
  }

  /** Méthodes génériques pour les requêtes API **/
  
  get<T>(endpoint: string, data?: any): any {
    return this.axiosInstance.get<T>(endpoint, data);
  }
      
  post<T>(endpoint: string, data: any): any {
    return this.axiosInstance.post<T>(endpoint, data);
  }

  put<T>(endpoint: string, data?: any): any {
    return this.axiosInstance.put<T>(endpoint, data);
  }

  delete<T>(endpoint: string): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(endpoint);
  }

  patch<T>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(endpoint, data);
  }

  postImage<T>(endpoint: string, data: any): any {
    return this.axiosInstance.post<T>(endpoint, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /** Gestion du panier **/
  
  getCart(): Promise<AxiosResponse<any>> {
    return this.axiosInstance.get('/cart/me');
  }

  addItemToCart(productId: string, plan: 'monthly' | 'yearly'): Promise<AxiosResponse<any>> {
    const userId = this.cookieService.get('user_id');
    return this.post('/cart/add', { productId, plan, userId });
  }

  updateCart(data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.put('/cart/update', data);
  }

  deleteItemFromCart(productId: string): Promise<AxiosResponse<any>> {
    const userId = this.cookieService.get('user_id');
    return this.axiosInstance.delete('/cart/delete', { data: { userId, productId } });
  }

  resetCart(): Promise<AxiosResponse<any>> {
    const userId = this.cookieService.get('user_id');
    return this.axiosInstance.delete('/cart/reset', { data: { userId: userId } });
  }

  checkoutPayment(): Promise<AxiosResponse<{ url: string }>> {
    return this.axiosInstance.post('/payment/checkout', {});
  }
  
  /** Gestion des catégories **/

  createCategory(data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.post('/categories', data);
  }

  getAllCategories(): Promise<AxiosResponse<any>> {
    return this.axiosInstance.get('/categories');
  }

  getCategoryById(id: string): Promise<AxiosResponse<any>> {
    return this.axiosInstance.get(`/categories/${id}`);
  }

  updateCategoryById(id: string, data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.put(`/categories/${id}`, data);
  }

  deleteCategoryById(id: string): Promise<AxiosResponse<any>> {
    return this.axiosInstance.delete(`/categories/${id}`);
  }

  getProductsByCategory(categoryId: string): Promise<AxiosResponse<any>> {
    return this.axiosInstance.get(`/products?category=${categoryId}`);
  }

  /** Gestion des produits **/

  createProduct(data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.post('/products', data);
  }

  getAllProducts(): Promise<AxiosResponse<any>> {
    return this.axiosInstance.get('/products');
  }

  getProductById(id: string): Promise<AxiosResponse<any>> {
    return this.axiosInstance.get(`/products/${id}`);
  }

  updateProductById(id: string, data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.put(`/products/${id}`, data);
  }

  deleteProductById(id: string): Promise<AxiosResponse<any>> {
    return this.axiosInstance.delete(`/products/${id}`);
  }

  /** Gestion des abonnements **/

  activateSubscription(data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.post('/subscription/activate', data);
  }

  cancelSubscription(id: string): Promise<AxiosResponse<any>> {
    return this.axiosInstance.post('/subscriptions/cancel/' + id);
  }

  updateSubscriptionEndDate(data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.post('/subscription/update-end-date', data);
  }

  isSubscriptionActive(userId: string): Promise<AxiosResponse<any>> {
    return this.axiosInstance.get(`/subscription/is-active/${userId}`);
  }

  /** Gestion des utilisateurs **/

  createUser(data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.post('/users/register', data);
  }

  getMe(): Promise<AxiosResponse<any>> {
    return this.axiosInstance.get('/users/me');
  }

  getAllUsers(): Promise<AxiosResponse<any>> {
    return this.axiosInstance.get('/users');
  }

  loginUser(data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.post('/users/login', data);
  }

  refreshUserToken(data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.post('/users/refresh', data);
  }

  forgotPassword(data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.post('/users/forgot-password', data);
  }

  validateUserAccount(data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.post('/users/validate', data);
  }

  resetUserPassword(data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.post('/users/reset-password', data);
  }

  getUserById(id: string): Promise<AxiosResponse<any>> {
    return this.axiosInstance.get(`/users/${id}`);
  }

  updateUserById(id: string, data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.put(`/users/${id}`, data);
  }

  addUserAddress(address: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.post(`/users/add-address`, address);
  }

  updateAddress(id: number, address: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.put(`/users/update-address/${id}`, address);
  }

  deleteUserAddress(id: number): Promise<AxiosResponse<any>> {
    return this.axiosInstance.delete(`/users/remove-address/${id}`);
  }

  deleteUserById(id: string): Promise<AxiosResponse<any>> {
    return this.axiosInstance.delete(`/users/${id}`);
  }

  patchUserById(id: string, data: any): Promise<AxiosResponse<any>> {
    return this.axiosInstance.patch(`/users/${id}`, data);
  }

  /** Gestion des Commandes **/
  getUserOrders(): Promise<AxiosResponse<any>> {
    return this.axiosInstance.get(`/orders/me`);
  }

  getUserOrderById(orderId: string): Promise<AxiosResponse<any>> {
    return this.axiosInstance.get(`/orders/by-session/${orderId}`);
  }

  /** Gestion des factures */
  sendInvoiceMail(subscriptionId: string): Promise<AxiosResponse<any>> {
    return this.axiosInstance.get(`/invoices/${subscriptionId}`);
  }

}
