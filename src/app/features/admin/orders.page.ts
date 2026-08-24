import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AdminService } from '../../core/admin.service';
import { Order, OrderStatus } from '../../core/models';
import { CentsPipe } from '../../shared/cents.pipe';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Aguardando',
  processing: 'Processando',
  paid: 'Pago',
  canceled: 'Cancelado',
  expired: 'Expirado',
};

@Component({
  selector: 'app-admin-orders',
  imports: [DatePipe, CentsPipe],
  template: `
    <h1>Pedidos</h1>

    <div class="filters">
      <button class="btn ghost small" [class.active]="status() === null" (click)="filter(null)">
        Todos
      </button>
      @for (option of statuses; track option) {
        <button
          class="btn ghost small"
          [class.active]="status() === option"
          (click)="filter(option)"
        >
          {{ label(option) }}
        </button>
      }
    </div>

    @if (loading()) {
      <p class="muted">Carregando pedidos…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (orders().length === 0) {
      <p class="muted">Nenhum pedido encontrado.</p>
    } @else {
      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders(); track order.id) {
              <tr>
                <td>
                  #{{ order.id.slice(-6) }}
                  <span class="muted block">{{ order.createdAt | date: 'dd/MM HH:mm' }}</span>
                </td>
                <td>
                  {{ order.customer.name }}
                  @if (order.customer.email) {
                    <span class="muted block">{{ order.customer.email }}</span>
                  }
                </td>
                <td>
                  @for (item of order.items; track item.productId) {
                    <span class="block">{{ item.quantity }}× {{ item.name }}</span>
                  }
                </td>
                <td>{{ order.total | cents }}</td>
                <td><span class="badge" [class]="order.status">{{ label(order.status) }}</span></td>
                <td class="actions">
                  @if (order.status === 'pending' || order.status === 'processing') {
                    <button class="btn small" (click)="confirm(order)">Confirmar pagamento</button>
                    <button class="btn ghost small" (click)="cancel(order)">Cancelar</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: `
    h1 {
      font-size: 1.3rem;
    }
    .filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    .filters .active {
      border-color: var(--brand);
      color: var(--brand);
    }
    .actions {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .block {
      display: block;
      font-size: 0.8rem;
    }
  `,
})
export class OrdersPage {
  private readonly admin = inject(AdminService);

  protected readonly statuses: OrderStatus[] = ['pending', 'paid', 'canceled', 'expired'];
  protected readonly orders = signal<Order[]>([]);
  protected readonly status = signal<OrderStatus | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected label(status: OrderStatus): string {
    return STATUS_LABELS[status];
  }

  protected filter(status: OrderStatus | null): void {
    this.status.set(status);
    this.load();
  }

  protected confirm(order: Order): void {
    this.admin.confirmPayment(order.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Não foi possível confirmar o pagamento.'),
    });
  }

  protected cancel(order: Order): void {
    this.admin.cancelOrder(order.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Não foi possível cancelar o pedido.'),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.admin.orders(this.status() ?? undefined).subscribe({
      next: (response) => {
        this.orders.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os pedidos.');
        this.loading.set(false);
      },
    });
  }
}
