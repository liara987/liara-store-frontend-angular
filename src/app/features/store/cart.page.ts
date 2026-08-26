import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { CentsPipe } from '../../shared/cents.pipe';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CentsPipe],
  template: `
    <h1>Carrinho</h1>

    @if (cart.isEmpty()) {
      <p class="muted">Seu carrinho está vazio.</p>
      <a routerLink="/" class="btn">Ver produtos</a>
    } @else {
      <div class="card">
        <table class="stack">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Preço</th>
              <th>Qtd.</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (item of cart.items(); track item.productId) {
              <tr>
                <td data-label="Produto">{{ item.name }}</td>
                <td data-label="Preço">{{ item.price | cents }}</td>
                <td data-label="Qtd.">
                  <input
                    type="number"
                    min="1"
                    [max]="item.stock"
                    [value]="item.quantity"
                    (input)="changeQuantity(item.productId, $event)"
                  />
                </td>
                <td data-label="Subtotal">{{ item.price * item.quantity | cents }}</td>
                <td>
                  <button class="btn ghost small" (click)="cart.remove(item.productId)">
                    Remover
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div class="footer-row">
          <span class="muted">Total estimado</span>
          <strong>{{ cart.subtotal() | cents }}</strong>
        </div>
        <p class="muted note">O valor final é sempre calculado pelo backend no checkout.</p>

        <div class="actions">
          <button class="btn ghost" (click)="cart.clear()">Limpar carrinho</button>
          <a routerLink="/checkout" class="btn">Finalizar compra</a>
        </div>
      </div>
    }
  `,
  styles: `
    h1 {
      font-size: 1.4rem;
    }
    input {
      width: 4.5rem;
    }
    .footer-row {
      display: flex;
      justify-content: space-between;
      padding-top: 1rem;
      font-size: 1.1rem;
    }
    .note {
      font-size: 0.8rem;
      margin: 0.25rem 0 0;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
      margin-top: 1rem;
    }
    @media (max-width: 640px) {
      input {
        width: 5.5rem;
      }
      .footer-row {
        flex-direction: column;
        gap: 0.2rem;
      }
      .actions {
        flex-direction: column-reverse;
      }
      .actions .btn {
        width: 100%;
      }
    }
  `,
})
export class CartPage {
  protected readonly cart = inject(CartService);

  protected changeQuantity(productId: string, event: Event): void {
    this.cart.setQuantity(productId, Number((event.target as HTMLInputElement).value));
  }
}
