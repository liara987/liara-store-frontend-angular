import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateOrderPayload, Order } from './models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  create(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/orders`, payload);
  }

  get(id: string): Observable<Order> {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${id}`);
  }

  refreshPayment(id: string): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/orders/${id}/refresh-payment`, {});
  }
}
