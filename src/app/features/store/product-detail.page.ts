import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { Product } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { CentsPipe } from '../../shared/cents.pipe';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, CentsPipe],
  template: `
    <a routerLink="/" class="muted back">← Voltar para a loja</a>

    @if (loading()) {
      <p class="muted">Carregando…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (product(); as item) {
      <div class="card detail">
        @if (item.images[0]; as image) {
          <img [src]="image.url" [alt]="image.alt ?? item.name" />
        } @else {
          <div class="placeholder" aria-hidden="true">sem imagem</div>
        }
        <div>
          <span class="badge">{{ item.category }}</span>
          <h1>{{ item.name }}</h1>
          <p class="price">{{ item.price | cents }}</p>
          <p>{{ item.description }}</p>
          <p class="muted">
            @if (item.stock > 0) {
              {{ item.stock }} em estoque
            } @else {
              Produto esgotado
            }
          </p>
          <div class="actions">
            <input
              type="number"
              min="1"
              [max]="item.stock"
              [value]="quantity()"
              (input)="setQuantity($event)"
              [disabled]="item.stock === 0"
            />
            <button class="btn" [disabled]="item.stock === 0" (click)="add(item)">
              Adicionar ao carrinho
            </button>
            <button class="btn ghost" [disabled]="item.stock === 0" (click)="buyNow(item)">
              Comprar agora
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .back {
      display: inline-block;
      margin-bottom: 1rem;
      font-size: 0.9rem;
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
      font-size: 1.5rem;
    }
    .price {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--brand-dark);
      margin: 0 0 0.75rem;
    }
    .actions {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
    .actions input {
      width: 5rem;
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
  private readonly router = inject(Router);

  protected readonly product = signal<Product | null>(null);
  protected readonly quantity = signal(1);
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
  }

  protected buyNow(product: Product): void {
    this.add(product);
    void this.router.navigate(['/carrinho']);
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
