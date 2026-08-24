import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Dashboard, Order, Paginated, Product } from './models';

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin`;

  dashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.base}/dashboard`);
  }

  products(search?: string): Observable<Paginated<Product>> {
    const params = search ? new HttpParams().set('search', search) : undefined;
    return this.http.get<Paginated<Product>>(`${this.base}/products`, { params });
  }

  createProduct(payload: ProductPayload): Observable<Product> {
    return this.http.post<Product>(`${this.base}/products`, payload);
  }

  updateProduct(id: string, payload: Partial<ProductPayload>): Observable<Product> {
    return this.http.patch<Product>(`${this.base}/products/${id}`, payload);
  }

  updateStock(
    id: string,
    operation: 'set' | 'increment',
    quantity: number,
  ): Observable<Product> {
    return this.http.patch<Product>(`${this.base}/products/${id}/stock`, { operation, quantity });
  }

  deactivateProduct(id: string): Observable<Product> {
    return this.http.delete<Product>(`${this.base}/products/${id}`);
  }

  uploadImages(id: string, files: FileList): Observable<Product> {
    const form = new FormData();
    Array.from(files).forEach((file) => form.append('images', file));
    return this.http.post<Product>(`${this.base}/products/${id}/images`, form);
  }

  orders(status?: string): Observable<Paginated<Order>> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<Paginated<Order>>(`${this.base}/orders`, { params });
  }

  confirmPayment(id: string): Observable<Order> {
    return this.http.post<Order>(`${this.base}/orders/${id}/confirm-payment`, {});
  }

  cancelOrder(id: string): Observable<Order> {
    return this.http.post<Order>(`${this.base}/orders/${id}/cancel`, {});
  }
}
