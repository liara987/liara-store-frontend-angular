import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { Product } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { CentsPipe } from '../../shared/cents.pipe';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CentsPipe],
  template: `
    <section class="hero card">
      <h1>Acessórios de programação</h1>
      <p class="muted">
        Escolha seus favoritos, pague por PIX e leve na hora. Sem frete, sem cadastro.
      </p>
    </section>

    <div class="filters" role="group" aria-label="Filtrar por categoria">
      <button
        class="btn ghost small"
        [class.active]="category() === null"
        [attr.aria-pressed]="category() === null"
        (click)="filterBy(null)"
      >
        Todos
      </button>
      @for (item of categories(); track item) {
        <button
          class="btn ghost small"
          [class.active]="category() === item"
          [attr.aria-pressed]="category() === item"
          (click)="filterBy(item)"
        >
          {{ item }}
        </button>
      }
    </div>

    @if (loading()) {
      <p class="sr-only" role="status">Carregando produtos…</p>
      <div class="grid" aria-hidden="true">
        @for (placeholder of skeletons; track placeholder) {
          <article class="card product">
            <div class="skeleton thumb"></div>
            <div class="skeleton line"></div>
            <div class="skeleton line short"></div>
          </article>
        }
      </div>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (products().length === 0) {
      <p class="muted">Nenhum produto disponível no momento.</p>
    } @else {
      <div class="grid">
        @for (product of products(); track product.id) {
          <article class="card product">
            <a [routerLink]="['/produto', product.slug]" class="product-link">
              @if (product.images[0]; as image) {
                <img
                  [src]="image.url"
                  [alt]="image.alt ?? product.name"
                  width="400"
                  height="400"
                  [attr.loading]="$index < 2 ? 'eager' : 'lazy'"
                  [attr.fetchpriority]="$index === 0 ? 'high' : null"
                  decoding="async"
                />
              } @else {
                <div class="placeholder" aria-hidden="true">sem imagem</div>
              }
              <h2>{{ product.name }}</h2>
            </a>
            <p class="price">{{ product.price | cents }}</p>
            @if (product.stock > 0) {
              <button class="btn block" (click)="add(product)">
                Adicionar<span class="sr-only"> {{ product.name }}</span> ao carrinho
              </button>
            } @else {
              <button class="btn block" disabled>Esgotado</button>
            }
          </article>
        }
      </div>
    }
  `,
  styles: `
    .hero {
      margin-bottom: 1.5rem;
    }
    .hero h1 {
      margin: 0 0 0.35rem;
      font-size: clamp(1.4rem, 5vw, 1.9rem);
      line-height: 1.2;
    }
    .hero p {
      margin: 0;
    }
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: var(--gap-tap);
      margin-bottom: 1.25rem;
    }
    .filters .active {
      border-color: var(--brand);
      background: var(--brand-soft);
      color: var(--brand-dark);
      font-weight: 700;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
      gap: 1rem;
    }
    .product-link {
      display: block;
    }
    .skeleton.thumb {
      width: 100%;
      aspect-ratio: 1;
    }
    .skeleton.line {
      height: 1rem;
      margin-top: 0.75rem;
    }
    .skeleton.line.short {
      width: 45%;
    }
    .product img,
    .product .placeholder {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 10px;
      background: #f4eae6;
    }
    .product .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
    }
    .product h2 {
      font-size: var(--text-body);
      margin: 0.6rem 0 0.2rem;
    }
    .price {
      margin: 0 0 0.9rem;
      font-size: var(--text-lead);
      font-weight: 700;
      color: var(--brand-dark);
    }
  `,
})
export class HomePage {
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);

  protected readonly skeletons = [0, 1, 2, 3];
  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<string[]>([]);
  protected readonly category = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.productService.categories().subscribe({
      next: (response) => this.categories.set(response.items),
      error: () => this.categories.set([]),
    });
    this.load();
  }

  protected filterBy(category: string | null): void {
    this.category.set(category);
    this.load();
  }

  protected add(product: Product): void {
    this.cart.add(product);
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.list({ category: this.category() ?? undefined }).subscribe({
      next: (response) => {
        this.products.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os produtos. Tente novamente.');
        this.loading.set(false);
      },
    });
  }
}
