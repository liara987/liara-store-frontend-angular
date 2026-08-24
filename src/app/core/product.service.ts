import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Paginated, Product } from './models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  list(options: { category?: string; search?: string } = {}): Observable<Paginated<Product>> {
    let params = new HttpParams();
    if (options.category) params = params.set('category', options.category);
    if (options.search) params = params.set('search', options.search);

    return this.http.get<Paginated<Product>>(`${environment.apiUrl}/products`, { params });
  }

  categories(): Observable<{ items: string[] }> {
    return this.http.get<{ items: string[] }>(`${environment.apiUrl}/products/categories`);
  }

  bySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${slug}`);
  }
}
