import { DatePipe } from '@angular/common';
import { Component, OnDestroy, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../../core/models';
import { OrderService } from '../../core/order.service';
import { CentsPipe } from '../../shared/cents.pipe';

const POLL_INTERVAL_MS = 5000;

@Component({
  selector: 'app-order',
  imports: [RouterLink, DatePipe, CentsPipe],
  template: `
    @if (loading()) {
      <p class="muted">Carregando pedido…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (order(); as current) {
      <div class="card">
        <div class="head">
          <div>
            <h1>Pedido #{{ current.id.slice(-6) }}</h1>
            <p class="muted">{{ current.customer.name }}</p>
          </div>
          <span class="badge" [class]="current.status">{{ statusLabel(current.status) }}</span>
        </div>

        @if (current.status === 'paid') {
          <div class="paid-box">
            <h2>Pagamento confirmado!</h2>
            <p class="muted">
              Obrigada pela compra
              @if (current.thankYouEmailSent && current.customer.email) {
                — enviamos um e-mail de agradecimento para {{ current.customer.email }}
              }
            </p>
          </div>
        } @else if (current.status === 'pending' || current.status === 'processing') {
          <div class="pix">
            @if (current.payment.pix?.qrCodeImage) {
              <img [src]="current.payment.pix?.qrCodeImage" alt="QR Code PIX" />
            }
            <div>
              <h2>Pague com PIX</h2>
              @if (current.payment.pix?.amountIncluded === false) {
                <p class="amount">
                  Valor a pagar: <strong>{{ current.total | cents }}</strong>
                </p>
                <p class="muted">
                  Escaneie o QR Code ou use o código copia e cola e <strong>digite o valor
                  acima</strong> no app do banco. Depois é só mostrar o comprovante para a
                  loja confirmar.
                </p>
              } @else {
                <p class="muted">
                  Escaneie o QR Code ou use o código copia e cola. Depois mostre o
                  comprovante para a loja confirmar o pagamento.
                </p>
              }
              @if (current.payment.expiresAt) {
                <p class="muted">
                  Expira em {{ current.payment.expiresAt | date: 'dd/MM/yyyy HH:mm' }}
                </p>
              }
              @if (current.payment.pix?.copyPaste) {
                <textarea readonly rows="4">{{ current.payment.pix?.copyPaste }}</textarea>
                <button class="btn" (click)="copy(current.payment.pix?.copyPaste ?? '')">
                  {{ copied() ? 'Código copiado!' : 'Copiar código' }}
                </button>
              }
            </div>
          </div>
        } @else {
          <p class="muted">Este pedido foi {{ statusLabel(current.status).toLowerCase() }}.</p>
        }

        <table>
          <tbody>
            @for (item of current.items; track item.productId) {
              <tr>
                <td>{{ item.quantity }}× {{ item.name }}</td>
                <td class="right">{{ item.subtotal | cents }}</td>
              </tr>
            }
            <tr>
              <td><strong>Total</strong></td>
              <td class="right"><strong>{{ current.total | cents }}</strong></td>
            </tr>
          </tbody>
        </table>

        <a routerLink="/" class="btn ghost back">Voltar para a loja</a>
      </div>
    }
  `,
  styles: `
    .head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    h1 {
      font-size: 1.3rem;
      margin: 0;
    }
    h2 {
      font-size: 1.05rem;
      margin-top: 0;
    }
    .paid-box {
      background: #e2f3e9;
      border-radius: 12px;
      padding: 1rem;
      margin: 1rem 0;
    }
    .paid-box h2 {
      color: var(--ok);
    }
    .pix {
      display: grid;
      grid-template-columns: 220px minmax(0, 1fr);
      gap: 1.25rem;
      margin: 1rem 0;
      align-items: start;
    }
    @media (max-width: 720px) {
      .pix {
        grid-template-columns: 1fr;
      }
    }
    .amount {
      font-size: 1.05rem;
      margin: 0 0 0.5rem;
    }
    .pix img {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: #fff;
    }
    textarea {
      font-family: monospace;
      font-size: 0.75rem;
      resize: vertical;
      margin-bottom: 0.6rem;
    }
    .right {
      text-align: right;
    }
    .back {
      margin-top: 1rem;
    }
  `,
})
export class OrderPage implements OnDestroy {
  readonly id = input.required<string>();

  private readonly orders = inject(OrderService);
  private pollTimer?: ReturnType<typeof setInterval>;

  protected readonly order = signal<Order | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly copied = signal(false);

  constructor() {
    queueMicrotask(() => {
      this.load();
      this.pollTimer = setInterval(() => this.load(), POLL_INTERVAL_MS);
    });
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  protected statusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      pending: 'Aguardando pagamento',
      processing: 'Processando',
      paid: 'Pago',
      canceled: 'Cancelado',
      expired: 'Expirado',
    };
    return labels[status];
  }

  protected copy(value: string): void {
    void navigator.clipboard.writeText(value).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    });
  }

  private load(): void {
    this.orders.get(this.id()).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
        if (order.status !== 'pending' && order.status !== 'processing' && this.pollTimer) {
          clearInterval(this.pollTimer);
          this.pollTimer = undefined;
        }
      },
      error: () => {
        this.error.set('Pedido não encontrado.');
        this.loading.set(false);
      },
    });
  }
}
