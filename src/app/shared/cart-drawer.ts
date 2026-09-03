import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../core/cart.service';
import { CustomerService } from '../core/customer.service';
import { OrderService } from '../core/order.service';
import { CentsPipe } from './cents.pipe';
import { CloseButtonComponent } from './close-button.component';

/**
 * Menu lateral de carrinho: abre por cima da loja (sem trocar de rota) e permite
 * gerar o PIX direto ali, para pedidos simples de 1-2 itens. Quem quiser revisar
 * com calma segue para a página /carrinho completa.
 */
@Component({
  selector: 'app-cart-drawer',
  imports: [RouterLink, ReactiveFormsModule, CentsPipe, CloseButtonComponent],
  template: `
    <div
      class="backdrop"
      [class.show]="cart.isOpen()"
      (click)="cart.close()"
      aria-hidden="true"
    ></div>

    <aside
      class="panel"
      [class.open]="cart.isOpen()"
      [attr.inert]="cart.isOpen() ? null : ''"
      role="dialog"
      aria-modal="true"
      aria-label="Carrinho"
    >
      <div class="head">
        <h2>Carrinho</h2>
        <app-close-button (click)="cart.close()" />
      </div>

      @if (cart.isEmpty()) {
        <div class="empty">
          <p class="muted">Seu carrinho está vazio.</p>
          <a routerLink="/" class="btn" (click)="cart.close()">Ver produtos</a>
        </div>
      } @else {
        <ul class="items">
          @for (item of cart.items(); track item.productId) {
            <li class="item">
              @if (item.imageUrl) {
                <img [src]="item.imageUrl" alt="" class="thumb" width="52" height="52" />
              } @else {
                <div class="thumb placeholder" aria-hidden="true"></div>
              }
              <div class="info">
                <p class="name">{{ item.name }}</p>
                <p class="muted price">{{ item.price | cents }}</p>
                <div class="stepper">
                  <button
                    class="btn ghost small step"
                    type="button"
                    [disabled]="item.quantity <= 1"
                    [attr.aria-label]="'Diminuir quantidade de ' + item.name"
                    (click)="cart.setQuantity(item.productId, item.quantity - 1)"
                  >
                    &minus;
                  </button>
                  <input
                    type="number"
                    inputmode="numeric"
                    min="1"
                    [max]="item.stock"
                    [value]="item.quantity"
                    [attr.aria-label]="'Quantidade de ' + item.name"
                    (input)="changeQuantity(item.productId, $event)"
                  />
                  <button
                    class="btn ghost small step"
                    type="button"
                    [disabled]="item.quantity >= item.stock"
                    [attr.aria-label]="'Aumentar quantidade de ' + item.name"
                    (click)="cart.setQuantity(item.productId, item.quantity + 1)"
                  >
                    +
                  </button>
                  <button
                    class="btn ghost small remove"
                    type="button"
                    (click)="cart.remove(item.productId)"
                  >
                    Remover<span class="sr-only"> {{ item.name }}</span>
                  </button>
                </div>
              </div>
            </li>
          }
        </ul>

        <div class="footer">
          <div class="total-row">
            <span class="muted">Total estimado</span>
            <strong>{{ cart.subtotal() | cents }}</strong>
          </div>

          <form [formGroup]="form" (ngSubmit)="quickCheckout()" class="quick-checkout">
            <label class="sr-only" for="drawer-name">Nome</label>
            <input
              id="drawer-name"
              formControlName="name"
              placeholder="Seu nome"
              autocomplete="name"
              autocapitalize="words"
              enterkeyhint="done"
              [attr.aria-invalid]="form.controls.name.touched && form.controls.name.invalid"
              aria-describedby="drawer-name-error"
            />
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <span class="error" id="drawer-name-error" role="alert">Informe seu nome.</span>
            }

            @if (error()) {
              <p class="error" role="alert">{{ error() }}</p>
            }

            <button class="btn block" type="submit" [disabled]="submitting()">
              {{ submitting() ? 'Gerando PIX…' : 'Gerar PIX e finalizar' }}
            </button>
          </form>

          <a routerLink="/carrinho" class="full-cart" (click)="cart.close()"
            >Ou continue no carrinho completo</a
          >
        </div>
      }
    </aside>
  `,
  styles: `
    .btn {
    }
    .quick-checkout {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgb(0 0 0 / 45%);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 30;
    }
    .backdrop.show {
      opacity: 1;
      pointer-events: auto;
    }
    .panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(380px, 100%);
      background: var(--surface);
      border-left: 1px solid var(--border);
      box-shadow: var(--shadow);
      transform: translateX(100%);
      transition: transform 0.25s ease;
      z-index: 31;
      display: flex;
      flex-direction: column;
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
    }
    .panel.open {
      transform: translateX(0);
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid var(--border);
    }
    .head h2 {
      margin: 0;
      font-size: var(--text-lead);
    }
    .close {
      flex: 0 0 var(--tap);
      min-width: var(--tap);
      padding: 0;
      font-size: 1.5rem;
      line-height: 1;
    }
    .empty {
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-start;
    }
    .items {
      list-style: none;
      margin: 0;
      padding: 0.5rem 1rem;
      overflow-y: auto;
      flex: 1;
    }
    .item {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border);
    }
    .item:last-child {
      border-bottom: none;
    }
    .thumb {
      width: 52px;
      height: 52px;
      border-radius: 10px;
      object-fit: cover;
      flex-shrink: 0;
      background: var(--brand-soft);
    }
    .thumb.placeholder {
      background: #f4eae6;
    }
    .info {
      flex: 1;
      min-width: 0;
    }
    .name {
      margin: 0 0 0.15rem;
      font-weight: 700;
      font-size: var(--text-body);
    }
    .price {
      margin: 0 0 0.5rem;
    }
    .stepper {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .stepper input {
      width: 3.5rem;
      min-height: 36px;
      text-align: center;
      padding: 0.3rem;
    }
    .step {
      flex: 0 0 36px;
      min-width: 36px;
      min-height: 36px;
      padding: 0;
      line-height: 1;
    }
    .remove {
      margin-left: auto;
      min-height: 36px;
    }
    .footer {
      border-top: 1px solid var(--border);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: var(--text-lead);
    }
    .full-cart {
      display: block;
      text-align: center;
      font-size: var(--text-body);
      text-decoration: underline;
      color: var(--muted);
      min-height: var(--tap);
      line-height: var(--tap);
    }
    @media (max-width: 480px) {
      .panel {
        width: 100%;
      }

      .full-cart {
        display: none;
      }
    }
  `,
})
export class CartDrawer {
  protected readonly cart = inject(CartService);
  private readonly orders = inject(OrderService);
  private readonly customer = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  @ViewChild('closeBtn') private readonly closeBtn?: ElementRef<HTMLButtonElement>;

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: [this.customer.read().name, [Validators.required, Validators.minLength(2)]],
  });

  constructor() {
    // Trava o scroll da página atrás do drawer e leva o foco para o botão de fechar.
    effect(() => {
      const open = this.cart.isOpen();
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        queueMicrotask(() => this.closeBtn?.nativeElement.focus());
      }
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.cart.isOpen()) {
      this.cart.close();
    }
  }

  protected changeQuantity(productId: string, event: Event): void {
    this.cart.setQuantity(productId, Number((event.target as HTMLInputElement).value));
  }

  protected quickCheckout(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name } = this.form.getRawValue();
    const email = this.customer.read().email;
    this.submitting.set(true);
    this.error.set(null);
    this.customer.save({ name: name.trim(), email });

    this.orders
      .create({
        customer: { name: name.trim(), ...(email ? { email } : {}) },
        items: this.cart.items().map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: 'pix',
      })
      .subscribe({
        next: (order) => {
          this.cart.clear();
          this.cart.close();
          this.submitting.set(false);
          void this.router.navigate(['/pedido', order.id]);
        },
        error: (response: HttpErrorResponse) => {
          this.error.set(
            response.error?.error?.message ??
              'Não foi possível gerar o PIX. Tente novamente ou use o carrinho completo.',
          );
          this.submitting.set(false);
        },
      });
  }
}
