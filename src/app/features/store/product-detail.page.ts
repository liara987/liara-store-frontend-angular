import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { Product } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { CentsPipe } from '../../shared/cents.pipe';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, CentsPipe],
  template: `
    <nav class="crumbs" aria-label="Você está aqui">
      <a routerLink="/">Loja</a>
      <span aria-hidden="true">›</span>
      <span class="muted current">{{ product()?.name ?? 'Produto' }}</span>
    </nav>

    @if (loading()) {
      <div class="card detail" aria-hidden="true">
        <div class="skeleton thumb"></div>
        <div>
          <div class="skeleton line"></div>
          <div class="skeleton line short"></div>
        </div>
      </div>
      <p class="sr-only" role="status">Carregando produto…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (product(); as item) {
      <div class="card detail">
        @if (item.images[0]; as image) {
          <img
            [src]="image.url"
            [alt]="image.alt ?? item.name"
            width="400"
            height="400"
            fetchpriority="high"
            decoding="async"
          />
        } @else {
          <div class="placeholder" aria-hidden="true">sem imagem</div>
        }
        <div>
          <span class="badge">{{ item.category }}</span>
          <h1>{{ item.name }}</h1>
          <p class="price">{{ item.price | cents }}</p>
          <p class="stock" [class.out]="item.stock === 0">
            @if (item.stock > 0) {
              {{ item.stock }} em estoque
            } @else {
              Produto esgotado
            }
          </p>
          <p>{{ item.description }}</p>
          <div class="actions">
            <div class="qty">
              <label for="quantidade">Quantidade</label>
              <input
                id="quantidade"
                type="number"
                inputmode="numeric"
                min="1"
                [max]="item.stock"
                [value]="quantity()"
                (input)="setQuantity($event)"
                [disabled]="item.stock === 0"
              />
            </div>
            <button class="btn ghost" [disabled]="item.stock === 0" (click)="buyNow(item)">
              Comprar agora
            </button>
          </div>
        </div>
      </div>

      <!-- CTA fixo na zona do polegar; no desktop volta ao fluxo do card. -->
      <div class="cta-bar card">
        <div class="cta-inner">
          <span class="cta-price">{{ item.price | cents }}</span>
          <button class="btn" [disabled]="item.stock === 0" (click)="add(item)">
            {{ added() ? 'Adicionado!' : 'Adicionar ao carrinho' }}
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    .crumbs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .crumbs a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: var(--tap);
      min-width: var(--tap);
      font-weight: 600;
      color: var(--brand-dark);
      text-decoration: underline;
    }
    .crumbs .current {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .detail {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
      gap: 1.5rem;
      align-items: start;
    }
    @media (max-width: 720px) {
      .detail {
        grid-template-columns: 1fr;
      }

      .cta-inner {
        display: flex;
        flex-direction: column;
      }
    }
    .detail img,
    .detail .placeholder {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 12px;
      background: #f4eae6;
    }
    .detail .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
    }
    h1 {
      margin: 0.5rem 0 0.25rem;
      font-size: clamp(1.35rem, 5vw, 1.6rem);
      line-height: 1.25;
    }
    .price {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--brand-dark);
      margin: 0 0 0.25rem;
    }
    .stock {
      margin: 0 0 0.75rem;
      font-weight: 600;
      color: var(--ok);
    }
    .stock.out {
      color: var(--danger);
    }
    .actions {
      display: flex;
      gap: var(--gap-tap);
      align-items: flex-end;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
    .qty input {
      width: 6rem;
    }
    .skeleton.thumb {
      width: 100%;
      aspect-ratio: 1;
    }
    .skeleton.line {
      height: 1.5rem;
      margin-bottom: 0.75rem;
    }
    .skeleton.line.short {
      width: 50%;
    }
    .cta-bar {
      position: sticky;
      bottom: 0;
      margin-top: 1rem;

      padding: 0.75rem 0 calc(0.75rem + env(safe-area-inset-bottom));
      background: color-mix(in srgb, var(--surface) 92%, transparent);
      backdrop-filter: blur(6px);
      border-top: 1px solid var(--border);
    }
    .cta-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--gap-tap);
      padding: 0 1rem;
    }
    .cta-price {
      font-size: var(--text-lead);
      font-weight: 800;
      color: var(--brand-dark);
    }
    .cta-inner .btn {
      flex: 1;
      max-width: 22rem;
    }
    @media (max-width: 480px) {
      .actions {
        flex-direction: column;
        align-items: stretch;
      }
      .actions input {
        width: 100%;
      }
      .actions .btn {
        width: 100%;
      }
    }
  `,
})
export class ProductDetailPage {
  readonly slug = input.required<string>();

  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);

  protected readonly product = signal<Product | null>(null);
  protected readonly quantity = signal(1);
  protected readonly added = signal(false);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    queueMicrotask(() => this.load());
  }

  protected setQuantity(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.quantity.set(Number.isFinite(value) && value > 0 ? Math.floor(value) : 1);
  }

  protected add(product: Product): void {
    this.cart.add(product, this.quantity());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }

  protected buyNow(product: Product): void {
    this.add(product);
    this.cart.open();
  }

  private load(): void {
    this.productService.bySlug(this.slug()).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Produto não encontrado.');
        this.loading.set(false);
      },
    });
  }
}
