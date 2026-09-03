import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { CustomerService } from '../../core/customer.service';
import { LastOrderService } from '../../core/last-order.service';
import { OrderService } from '../../core/order.service';
import { CentsPipe } from '../../shared/cents.pipe';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, CentsPipe],
  template: `
    <h1>Checkout</h1>

    @if (cart.isEmpty()) {
      <p class="muted">Seu carrinho está vazio.</p>
      <a routerLink="/" class="btn">Ver produtos</a>
    } @else {
      <div class="layout">
        <!-- Resumo antes do formulário no mobile (ordem via CSS grid). -->
        <form class="card" [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label for="name">Nome *</label>
            <input
              id="name"
              formControlName="name"
              autocomplete="name"
              autocapitalize="words"
              enterkeyhint="next"
              [attr.aria-invalid]="form.controls.name.touched && form.controls.name.invalid"
              aria-describedby="name-error"
            />
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <span class="error" id="name-error" role="alert">Informe seu nome.</span>
            }
          </div>

          <div class="field">
            <label for="email">E-mail (opcional)</label>
            <input
              id="email"
              type="email"
              inputmode="email"
              formControlName="email"
              autocomplete="email"
              autocapitalize="none"
              spellcheck="false"
              enterkeyhint="done"
              [attr.aria-invalid]="form.controls.email.touched && form.controls.email.invalid"
              aria-describedby="email-error email-hint"
            />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <span class="error" id="email-error" role="alert">E-mail inválido.</span>
            }
            <p class="muted hint" id="email-hint">
              Se informado, enviamos um e-mail de agradecimento após a confirmação do pagamento.
            </p>
          </div>

          <div class="field">
            <span class="label">Pagamento</span>
            <div class="pix">PIX</div>
          </div>

          @if (error()) {
            <p class="error" role="alert">{{ error() }}</p>
          }

          <button class="btn submit" type="submit" [disabled]="submitting()">
            {{ submitting() ? 'Gerando PIX…' : 'Gerar PIX' }}
          </button>
        </form>

        <aside class="card">
          <h2>Resumo</h2>
          @for (item of cart.items(); track item.productId) {
            <div class="line">
              <span>{{ item.quantity }}× {{ item.name }}</span>
              <span>{{ item.price * item.quantity | cents }}</span>
            </div>
          }
          <div class="line total">
            <strong>Total estimado</strong>
            <strong>{{ cart.subtotal() | cents }}</strong>
          </div>
        </aside>
      </div>
    }
  `,
  styles: `
    h1 {
      font-size: var(--text-title);
    }
    .label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.35rem;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
      gap: 1rem;
      align-items: start;
    }
    @media (max-width: 760px) {
      .layout {
        grid-template-columns: 1fr;
      }
      .layout aside {
        order: -1;
      }
    }
    .hint {
      margin: 0.3rem 0 0;
    }
    .pix {
      border: 1px solid var(--brand);
      color: var(--brand-dark);
      border-radius: 10px;
      padding: 0.6rem 0.75rem;
      font-weight: 700;
    }
    .submit {
      width: 100%;
      margin-top: 1.2rem;
    }
    h2 {
      font-size: var(--text-lead);
      margin-top: 0;
    }
    .line {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.35rem 0;
    }
    .total {
      border-top: 1px solid var(--border);
      margin-top: 0.5rem;
      padding-top: 0.7rem;
    }
  `,
})
export class CheckoutPage {
  protected readonly cart = inject(CartService);
  private readonly orders = inject(OrderService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly customer = inject(CustomerService);
  private readonly lastOrder = inject(LastOrderService);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: [this.customer.read().name, [Validators.required, Validators.minLength(2)]],
    email: [this.customer.read().email, [Validators.email]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email } = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);
    this.customer.save({ name: name.trim(), email: email.trim() });

    this.orders
      .create({
        customer: { name: name.trim(), ...(email.trim() ? { email: email.trim() } : {}) },
        items: this.cart.items().map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: 'pix',
      })
      .subscribe({
        next: (order) => {
          this.lastOrder.save({
            id: order.id,
            customerName: order.customer.name,
            total: order.total,
            createdAt: order.createdAt,
            status: order.status,
          });
          this.cart.clear();
          void this.router.navigate(['/pedido', order.id]);
        },
        error: (response: HttpErrorResponse) => {
          this.error.set(
            response.error?.error?.message ??
              'Não foi possível criar o pedido. Revise o carrinho e tente novamente.',
          );
          this.submitting.set(false);
        },
      });
  }
}
