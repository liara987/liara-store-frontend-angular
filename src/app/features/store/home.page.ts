import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, of, switchMap } from 'rxjs';
import { CartService } from '../../core/cart.service';
import { I18nService } from '../../core/i18n.service';
import { LastOrderService } from '../../core/last-order.service';
import { Product } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { SearchService } from '../../core/search.service';
import { CarouselComponent, CarouselSlide } from '../../shared/carousel.component';
import { CentsPipe } from '../../shared/cents.pipe';

const PAGE_SIZE = 12;

type SortOption = 'default' | 'price_asc' | 'price_desc';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CentsPipe, CarouselComponent],
  template: `
    <!-- ===== CARROSSEL FULL-BLEED ===== -->
    <div class="banner-hero">
      <app-carousel [slides]="banners" [autoplayInterval]="5000" />

      <!-- Trust strip dentro da faixa brand -->
      <div class="trust-row" role="list">
        <div class="trust-item" role="listitem">{{ t().trustPix }}</div>
        <div class="trust-item" role="listitem">{{ t().trustNoShipping }}</div>
        <div class="trust-item" role="listitem">{{ t().trustPickup }}</div>
        <div class="trust-item" role="listitem">{{ t().trustSafe }}</div>
      </div>
    </div>

    <!-- ===== BANNER ÚLTIMO PEDIDO ===== -->
    @if (lastOrderData(); as lo) {
      <div class="last-order-banner" role="status">
        <span class="last-order-icon">🛍️</span>
        <div class="last-order-text">
          <span class="last-order-title">Seu último pedido</span>
          <span class="last-order-sub">{{ lo.customerName }} · {{ lo.total | cents }}</span>
        </div>
        <a [routerLink]="['/pedido', lo.id]" class="btn small last-order-btn">Ver pedido</a>
        <button
          class="last-order-close"
          type="button"
          aria-label="Dispensar"
          (click)="dismissLastOrder()"
        >
          ✕
        </button>
      </div>
    }

    <!-- ===== FILTROS + ORDENAÇÃO ===== -->
    <div class="section-header">
      <h2 class="section-title">
        @if (searchQuery().trim()) {
          {{ t().resultsFor }} "{{ searchQuery().trim() }}"
        } @else if (category()) {
          {{ category() }}
        } @else {
          {{ t().allProducts }}
        }
      </h2>

      <!-- Ordenação -->
      <div class="sort-wrap">
        <label class="sr-only" for="sort-select">Ordenar por</label>
        <select
          id="sort-select"
          class="sort-select"
          [value]="sort()"
          (change)="onSortChange($event)"
        >
          <option value="default">Padrão</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
        </select>
      </div>
    </div>

    <div class="filters" role="group" aria-label="Filtrar por categoria">
      <button
        class="filter-chip"
        [class.active]="category() === null"
        [attr.aria-pressed]="category() === null"
        (click)="filterBy(null)"
      >
        {{ t().filterAll }}
      </button>
      @for (item of categories(); track item) {
        <button
          class="filter-chip"
          [class.active]="category() === item"
          [attr.aria-pressed]="category() === item"
          (click)="filterBy(item)"
        >
          {{ item }}
        </button>
      }
    </div>

    <!-- ===== GRID ===== -->
    @if (loading()) {
      <p class="sr-only" role="status">{{ t().loadingProducts }}</p>
      <div class="grid" aria-hidden="true">
        @for (s of skeletons; track s) {
          <article class="card product skeleton-card">
            <div class="skeleton thumb"></div>
            <div class="skeleton-body">
              <div class="skeleton line"></div>
              <div class="skeleton line short"></div>
              <div class="skeleton line price-line"></div>
            </div>
          </article>
        }
      </div>
    } @else if (error()) {
      <div class="empty-state">
        <span class="empty-icon">⚠️</span>
        <p class="error">{{ error() }}</p>
      </div>
    } @else if (pagedProducts().length === 0) {
      <div class="empty-state" role="status">
        <span class="empty-icon">🔍</span>
        @if (searchQuery().trim()) {
          <p class="muted">{{ t().noResults(searchQuery().trim()) }}</p>
          <button class="btn ghost small" (click)="searchSvc.clear()">{{ t().clearSearch }}</button>
        } @else {
          <p class="muted">{{ t().noProducts }}</p>
        }
      </div>
    } @else {
      <div class="grid">
        @for (product of pagedProducts(); track product.id) {
          <article class="card product" [class.out-of-stock]="product.stock === 0">
            <a
              [routerLink]="['/produto', product.slug]"
              class="product-link"
              [attr.aria-label]="product.name"
            >
              <div class="product-img-wrap">
                @if (product.images[0]; as image) {
                  <img
                    [src]="image.url"
                    [alt]="image.alt ?? product.name"
                    class="product-img"
                    width="240"
                    height="240"
                    [attr.loading]="$index < 4 ? 'eager' : 'lazy'"
                    [attr.fetchpriority]="$index === 0 ? 'high' : null"
                    decoding="async"
                  />
                } @else {
                  <div class="placeholder" aria-hidden="true">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        stroke="currentColor"
                        stroke-width="1.5"
                        opacity=".3"
                      />
                      <circle
                        cx="8.5"
                        cy="8.5"
                        r="1.5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        opacity=".3"
                      />
                      <path
                        d="m21 15-5-5L5 21"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        opacity=".3"
                      />
                    </svg>
                  </div>
                }
                <span class="badge cat">{{ product.category }}</span>
                @if (product.stock <= 3 && product.stock > 0) {
                  <span class="stock-badge">{{ t().lastUnits(product.stock) }}</span>
                }
                @if (product.stock === 0) {
                  <span class="out-badge">{{ t().outOfStock }}</span>
                }
              </div>
              <h2>{{ product.name }}</h2>
            </a>
            <p class="price">{{ product.price | cents }}</p>

            @if (product.stock > 0) {
              <button
                type="button"
                class="fab-cart"
                [class.added]="addedId() === product.id"
                (click)="add(product)"
                [attr.aria-label]="t().addToCart + ': ' + product.name"
              >
                @if (addedId() === product.id) {
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <path
                      d="M4 12.5l5 5L20 7"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <circle cx="9" cy="20" r="1.4" fill="currentColor" />
                    <circle cx="17" cy="20" r="1.4" fill="currentColor" />
                    <path
                      d="M2.5 3h2l1.8 10.2a2 2 0 0 0 2 1.65h7.4a2 2 0 0 0 1.96-1.6L19.4 7H5.1"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span class="fab-plus" aria-hidden="true">+</span>
                }
              </button>
            }
          </article>
        }
      </div>

      <!-- ===== PAGINAÇÃO ===== -->
      @if (totalPages() > 1) {
        <nav class="pagination" aria-label="Paginação">
          <button
            class="page-btn"
            type="button"
            [disabled]="page() === 1"
            aria-label="Página anterior"
            (click)="goToPage(page() - 1)"
          >
            ‹
          </button>

          @for (p of pageNumbers(); track p) {
            @if (p === -1) {
              <span class="page-ellipsis">…</span>
            } @else {
              <button
                class="page-btn"
                type="button"
                [class.active]="p === page()"
                [attr.aria-current]="p === page() ? 'page' : null"
                (click)="goToPage(p)"
              >
                {{ p }}
              </button>
            }
          }

          <button
            class="page-btn"
            type="button"
            [disabled]="page() === totalPages()"
            aria-label="Próxima página"
            (click)="goToPage(page() + 1)"
          >
            ›
          </button>
        </nav>
      }
    }
  `,
  styles: `
    /* ===== FULL-BLEED BANNER ===== */
    .banner-hero {
      /* quebra o container pai e vai de borda a borda */
      margin-left: calc(50% - 50vw);
      width: 100vw;
      background: var(--brand);
      /* cancela o padding-top do .content */
      margin-top: -1.5rem;
      margin-bottom: 1.75rem;
    }

    /* trust strip dentro da faixa brand */
    .trust-row {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0;
      background: var(--brand-dark);
    }
    .trust-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.55rem 1.1rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      border-right: 1px solid rgba(255, 255, 255, 0.15);
      white-space: nowrap;
    }
    .trust-item:last-child {
      border-right: none;
    }
    @media (max-width: 600px) {
      .trust-row {
        justify-content: flex-start;
        overflow-x: auto;
        flex-wrap: nowrap;
        scrollbar-width: none;
      }
      .trust-row::-webkit-scrollbar {
        display: none;
      }
    }

    /* ===== FILTROS ===== */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .section-title {
      margin: 0;
      font-size: var(--text-title);
      font-weight: 700;
      color: var(--ink);
    }

    /* Ordenação */
    .sort-select {
      appearance: none;
      -webkit-appearance: none;
      padding: 0.4rem 2rem 0.4rem 0.75rem;
      border: 1.5px solid var(--border-dark);
      border-radius: 999px;
      background: var(--surface-2)
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")
        no-repeat right 0.6rem center;
      color: var(--ink);
      font: inherit;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      min-height: 38px;
      transition: border-color 0.15s ease;
    }
    .sort-select:focus {
      outline: none;
      border-color: var(--brand);
      box-shadow: 0 0 0 3px var(--brand-soft);
    }

    /* Banner último pedido */
    .last-order-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1.25rem;
      background: var(--brand-soft);
      border: 1.5px solid var(--brand);
      border-radius: var(--radius);
      animation: slide-down 0.3s ease;
    }
    @keyframes slide-down {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .last-order-icon {
      font-size: 1.4rem;
      flex-shrink: 0;
    }
    .last-order-text {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }
    .last-order-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--brand-dark);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .last-order-sub {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--ink);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .last-order-btn {
      flex-shrink: 0;
      font-size: 0.82rem;
      padding: 0.35rem 0.9rem;
      min-height: 34px;
    }
    .last-order-close {
      flex-shrink: 0;
      background: none;
      border: none;
      color: var(--muted);
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0.25rem;
      min-height: 32px;
      min-width: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        background 0.15s ease,
        color 0.15s ease;
    }
    .last-order-close:hover {
      background: var(--border);
      color: var(--ink);
    }
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .filter-chip {
      display: inline-flex;
      align-items: center;
      min-height: var(--tap);
      padding: 0.4rem 1rem;
      border: 1.5px solid var(--border-dark);
      border-radius: 999px;
      background: var(--surface);
      color: var(--ink);
      font: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .filter-chip:hover {
      border-color: var(--brand);
      color: var(--brand);
    }
    .filter-chip.active {
      border-color: var(--brand);
      background: var(--brand);
      color: #fff;
    }

    /* ===== GRID ===== */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
      gap: 1rem;
    }
    @media (max-width: 480px) {
      .grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }
    }

    /* ===== PRODUCT CARD ===== */
    .product {
      position: relative; /* âncora para o FAB de adicionar ao carrinho */
      display: flex;
      flex-direction: column;
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    }
    .product:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.13);
    }
    .product-link {
      display: block;
      text-decoration: none;
      color: inherit;
      flex: 1;
    }
    .product-img-wrap {
      position: relative;
      aspect-ratio: 1;
      background: var(--surface-2);
      overflow: hidden;
      border-radius: 10px;
      margin-bottom: 0.6rem;
    }
    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .product:hover .product-img {
      transform: scale(1.04);
    }
    .placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
    }
    .cat {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      font-size: 0.72rem;
      padding: 0.15rem 0.55rem;
      background: var(--brand-soft);
      color: var(--brand-dark);
    }
    .stock-badge {
      position: absolute;
      bottom: 0.5rem;
      left: 0.5rem;
      padding: 0.15rem 0.55rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      background: var(--warn-soft);
      color: var(--warn);
    }
    .product h2 {
      font-size: 0.92rem;
      font-weight: 600;
      margin: 0 0 0.35rem;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      color: var(--ink);
    }
    .price {
      margin: 0 0 0.9rem;
      font-size: var(--text-lead);
      font-weight: 700;
      color: var(--brand-dark);
    }

    /* ===== FAB "ADICIONAR AO CARRINHO" ===== */
    .fab-cart {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: none;
      background: var(--brand);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
      transition:
        transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
        background-color 0.2s ease,
        box-shadow 0.15s ease;
    }
    .fab-cart:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.24);
    }
    .fab-cart:active {
      transform: scale(0.9);
    }
    .fab-plus {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      color: var(--brand-dark);
      font-size: 0.7rem;
      font-weight: 800;
      line-height: 16px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    }
    .fab-cart.added {
      background: var(--ok, #16a34a);
      animation: fab-pop 0.45s ease;
    }
    @keyframes fab-pop {
      0% {
        transform: scale(1);
      }
      35% {
        transform: scale(1.3);
      }
      60% {
        transform: scale(0.9);
      }
      100% {
        transform: scale(1);
      }
    }

    /* ===== SKELETON ===== */
    .skeleton-card {
      pointer-events: none;
    }
    .skeleton.thumb {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 10px;
    }
    .skeleton-body {
      padding: 0.1rem 0;
    }
    .skeleton.line {
      height: 0.9rem;
      border-radius: 6px;
      margin-top: 0.6rem;
    }
    .skeleton.line.short {
      width: 55%;
    }
    .skeleton.line.price-line {
      width: 40%;
      height: 1.1rem;
    }

    /* ===== EMPTY STATE ===== */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      text-align: center;
    }
    .empty-icon {
      font-size: 2.5rem;
    }

    /* ===== OUT OF STOCK ===== */
    .out-of-stock {
      opacity: 0.6;
    }
    .out-badge {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      white-space: nowrap;
      pointer-events: none;
    }

    /* ===== PAGINAÇÃO ===== */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.3rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }
    .page-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 38px;
      min-height: 38px;
      padding: 0 0.6rem;
      border: 1.5px solid var(--border-dark);
      border-radius: 8px;
      background: var(--surface);
      color: var(--ink);
      font: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .page-btn:hover:not(:disabled) {
      border-color: var(--brand);
      color: var(--brand);
      background: var(--brand-soft);
    }
    .page-btn.active {
      border-color: var(--brand);
      background: var(--brand);
      color: #fff;
    }
    .page-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .page-ellipsis {
      padding: 0 0.25rem;
      color: var(--muted);
      font-size: 0.9rem;
      user-select: none;
    }
  `,
})
export class HomePage {
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly lastOrderSvc = inject(LastOrderService);
  protected readonly searchSvc = inject(SearchService);
  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;
  protected readonly searchQuery = this.searchSvc.query;

  protected readonly skeletons = [0, 1, 2, 3, 4, 5, 6, 7];
  protected readonly allProducts = signal<Product[]>([]);
  protected readonly categories = signal<string[]>([]);
  protected readonly category = signal<string | null>(null);
  protected readonly sort = signal<SortOption>('default');
  protected readonly page = signal(1);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly lastOrderData = signal(this.lastOrderSvc.read());

  /** Id do produto recém adicionado, usado para o feedback visual do FAB. */
  protected readonly addedId = signal<string | null>(null);

  /** Produtos ordenados: por preço se selecionado, sempre com esgotados no final. */
  protected readonly sortedProducts = computed(() => {
    const list = [...this.allProducts()];

    const s = this.sort();
    if (s === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (s === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    }

    // Esgotados sempre no final
    return list.sort((a, b) => {
      if (a.stock === 0 && b.stock > 0) return 1;
      if (a.stock > 0 && b.stock === 0) return -1;
      return 0;
    });
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedProducts().length / PAGE_SIZE)),
  );

  /** Fatia da página atual */
  protected readonly pagedProducts = computed(() => {
    const p = this.page();
    const start = (p - 1) * PAGE_SIZE;
    return this.sortedProducts().slice(start, start + PAGE_SIZE);
  });

  /** Números de página com reticências — -1 representa "…" */
  protected readonly pageNumbers = computed<number[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [1];
    if (current > 3) pages.push(-1);
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
      pages.push(p);
    }
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

  protected readonly banners: CarouselSlide[] = [
    {
      imageUrl:
        'https://res.cloudinary.com/jebe8tbc/image/upload/v1788429525/Gemini_Generated_Image_4jxlx14jxlx14jxl.jpg',
      alt: 'Jaqueta com pins e buttons',
      title: 'Use o que você ama',
      subtitle: 'Pins e buttons pra deixar sua jaqueta com a sua cara.',
      bgColor: '#1e1e2e',
    },
    {
      imageUrl:
        'https://res.cloudinary.com/jebe8tbc/image/upload/v1788429538/Gemini_Generated_Image_741cp0741cp0741c.jpg',
      alt: 'Setup de programador',
      title: 'Feito para quem faz acontecer',
      subtitle: 'Acessórios que combinam com o seu setup e com quem você é.',
      bgColor: '#f0db4f',
    },
    {
      imageUrl:
        'https://res.cloudinary.com/jebe8tbc/image/upload/v1788429697/Gemini_Generated_Image_tfy33xtfy33xtfy3.jpg',
      alt: 'Homem feliz com presente',
      title: 'Presente perfeito pra dev',
      subtitle: 'De dev pra dev — com muito estilo e bom gosto.',
      bgColor: '#5382a1',
    },
  ];

  private readonly queries = new Subject<void>();

  constructor() {
    this.productService.categories().subscribe({
      next: (r) => this.categories.set(r.items),
      error: () => this.categories.set([]),
    });

    // Reage ao SearchService com debounce; reseta para página 1
    effect(() => {
      this.searchSvc.query();
      this.page.set(1);
      this.load();
    });

    this.queries
      .pipe(
        debounceTime(250),
        switchMap(() =>
          this.productService
            .list({
              category: this.category() ?? undefined,
              search: this.searchSvc.query().trim() || undefined,
            })
            .pipe(
              catchError(() => {
                this.error.set('Não foi possível carregar os produtos. Tente novamente.');
                return of(null);
              }),
            ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        if (response) this.allProducts.set(response.items);
        this.loading.set(false);
      });
  }

  protected filterBy(cat: string | null): void {
    this.category.set(cat);
    this.page.set(1);
    this.load();
  }

  protected onSortChange(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as SortOption);
    this.page.set(1);
  }

  protected goToPage(p: number): void {
    const clamped = Math.max(1, Math.min(p, this.totalPages()));
    this.page.set(clamped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected add(product: Product): void {
    this.cart.add(product);
    this.addedId.set(product.id);
    setTimeout(() => {
      if (this.addedId() === product.id) this.addedId.set(null);
    }, 700);
  }

  protected dismissLastOrder(): void {
    this.lastOrderSvc.clear();
    this.lastOrderData.set(null);
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.queries.next();
  }
}
