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

    <div class="filters" role="group" aria-label="Filtrar pedidos por status">
      <button
        class="btn ghost small"
        [class.active]="status() === null"
        [attr.aria-pressed]="status() === null"
        (click)="filter(null)"
      >
        Todos
      </button>
      @for (option of statuses; track option) {
        <button
          class="btn ghost small"
          [class.active]="status() === option"
          [attr.aria-pressed]="status() === option"
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
        <table class="responsive-table">
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
                <td data-label="Pedido">
                  <span>
                    #{{ order.id.slice(-6) }}
                    <span class="muted block">{{ order.createdAt | date: 'dd/MM HH:mm' }}</span>
                  </span>
                </td>
                <td data-label="Cliente">
                  <span>
                    {{ order.customer.name }}
                    @if (order.customer.email) {
                      <span class="muted block">{{ order.customer.email }}</span>
                    }
                  </span>
                </td>
                <td data-label="Itens">
                  <span>
                    @for (item of order.items; track item.productId) {
                      <span class="block">{{ item.quantity }}× {{ item.name }}</span>
                    }
                  </span>
                </td>
                <td data-label="Total">{{ order.total | cents }}</td>
                <td data-label="Status">
                  <span class="badge" [class]="order.status">{{ label(order.status) }}</span>
                </td>
                <td class="actions" data-label="Ações">
                  @if (order.status === 'pending' || order.status === 'processing') {
                    <button class="btn small" (click)="confirm(order)">
                      Confirmar pagamento<span class="sr-only">
                        do pedido de {{ order.customer.name }}</span
                      >
                    </button>
                    <button class="btn ghost small" (click)="cancel(order)">
                      Cancelar<span class="sr-only"> pedido de {{ order.customer.name }}</span>
                    </button>
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
      font-size: var(--text-title);
    }
    .filters {
      display: flex;
      gap: var(--gap-tap);
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    .filters .active {
      border-color: var(--brand);
      background: var(--brand-soft);
      color: var(--brand-dark);
      font-weight: 700;
    }
    .actions {
      display: flex;
      gap: var(--gap-tap);
      flex-wrap: wrap;
    }
    .block {
      display: block;
    }
    @media (max-width: 900px) {
      .actions {
        justify-content: flex-end;
      }
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
