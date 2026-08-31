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

    <div class="filters">
      <button class="btn ghost small" [class.active]="category() === null" (click)="filterBy(null)">
        Todos
      </button>
      @for (item of categories(); track item) {
        <button
          class="btn ghost small"
          [class.active]="category() === item"
          (click)="filterBy(item)"
        >
          {{ item }}
        </button>
      }
    </div>

    @if (loading()) {
      <p class="muted">Carregando produtos…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (products().length === 0) {
      <p class="muted">Nenhum produto disponível no momento.</p>
    } @else {
      <div class="grid">
        @for (product of products(); track product.id) {
          <article class="card product">
            <a [routerLink]="['/produto', product.slug]">
              @if (product.images[0]; as image) {
                <img [src]="image.url" [alt]="image.alt ?? product.name" />
              } @else {
                <div class="placeholder" aria-hidden="true">sem imagem</div>
              }
              <h2>{{ product.name }}</h2>
            </a>
            <p class="price">{{ product.price | cents }}</p>
            @if (product.stock > 0) {
              <button class="btn" (click)="add(product)">Adicionar ao carrinho</button>
            } @else {
              <button class="btn" disabled>Esgotado</button>
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
      font-size: 1.6rem;
    }
    .hero p {
      margin: 0;
    }
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .filters .active {
      border-color: var(--brand);
      color: var(--brand);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
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
      font-size: 0.85rem;
    }
    .product h2 {
      font-size: 1rem;
      margin: 0.6rem 0 0.2rem;
    }
    .price {
      margin: 0 0 0.8rem;
      font-weight: 700;
      color: var(--brand-dark);
    }
    .product .btn {
      width: 100%;
    }
  `,
})
export class HomePage {
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);

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
