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
        <table class="responsive-table">
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
                    inputmode="numeric"
                    min="1"
                    [max]="item.stock"
                    [value]="item.quantity"
                    [attr.aria-label]="'Quantidade de ' + item.name"
                    (input)="changeQuantity(item.productId, $event)"
                  />
                </td>
                <td data-label="Subtotal">{{ item.price * item.quantity | cents }}</td>
                <td>
                  <button class="btn ghost small remove" (click)="cart.remove(item.productId)">
                    Remover<span class="sr-only"> {{ item.name }}</span>
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
      font-size: var(--text-title);
    }
    input {
      width: 5.5rem;
    }
    .footer-row {
      display: flex;
      justify-content: space-between;
      gap: var(--gap-tap);
      padding-top: 1rem;
      font-size: var(--text-lead);
    }
    .note {
      margin: 0.25rem 0 0;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--gap-tap);
      margin-top: 1rem;
    }
    @media (max-width: 720px) {
      .remove {
        width: 100%;
      }
      .actions .btn {
        flex: 1 1 100%;
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
