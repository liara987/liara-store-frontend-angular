import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { CartService } from './core/cart.service';
import { I18nService } from './core/i18n.service';
import { SearchService } from './core/search.service';
import { ThemeService } from './core/theme.service';
import { CartDrawer } from './shared/cart-drawer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CartDrawer],
  template: `
    <a class="skip" href="#conteudo">Ir para o conteúdo</a>

    <header class="topbar">
      <div class="container bar">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <img
            class="logo-img"
            src="https://res.cloudinary.com/jebe8tbc/image/upload/v1788214399/liara-store-logo.png"
            alt="Liara Store"
          />
          <span class="logo-text">Liara Store</span>
        </a>

        <!-- Busca — só na home -->
        @if (isHome()) {
          <div class="header-search" role="search">
            <label class="sr-only" for="header-busca">{{ t().searchPlaceholder }}</label>
            <svg
              class="search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
              <path
                d="m21 21-4.35-4.35"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <input
              id="header-busca"
              type="search"
              class="header-search-input"
              [placeholder]="t().searchPlaceholder"
              autocomplete="off"
              enterkeyhint="search"
              [value]="search.query()"
              (input)="onSearch($event)"
            />
            @if (search.query()) {
              <button
                class="search-clear"
                type="button"
                [attr.aria-label]="t().searchClear"
                (click)="search.clear()"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M18 6 6 18M6 6l12 12"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            }
          </div>
        }

        <!-- Controles à direita -->
        <div class="nav-controls">
          <!-- Toggle dark / light -->
          <button
            class="theme-btn"
            type="button"
            [attr.aria-label]="t().toggleTheme"
            (click)="theme.toggle()"
          >
            @if (theme.theme() === 'dark') {
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" />
                <path
                  d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            } @else {
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            }
          </button>

          <!-- Carrinho -->
          <button
            type="button"
            class="cart-btn"
            [attr.aria-label]="cartLabel()"
            (click)="cart.open()"
          >
            <span class="cart-icon-wrap">
              <svg
                class="cart-icon"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 4h2l.6 2M6.6 6H21l-2 8H8L6.6 6Z"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle cx="9.5" cy="19" r="1.6" fill="currentColor" />
                <circle cx="17" cy="19" r="1.6" fill="currentColor" />
              </svg>
              @if (cart.count() > 0) {
                <span class="count" aria-hidden="true">{{ cart.count() }}</span>
              }
            </span>
          </button>
        </div>
      </div>
    </header>

    <main id="conteudo" class="container content">
      <router-outlet />
    </main>

    <app-cart-drawer />

    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <img
            class="footer-logo"
            src="https://res.cloudinary.com/jebe8tbc/image/upload/v1788214399/liara-store-logo.png"
            alt="Liara Store"
          />
          <div>
            <p class="footer-name">Liara Store</p>
            <p class="footer-tagline">Acessórios de programação com estilo</p>
          </div>
        </div>

        <div class="footer-links">
          <p class="footer-follow">Siga nas redes sociais</p>
          <div class="social-icons">
            <a
              href="https://linkedin.com/in/liara-programadora"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              class="social-link"
            >
              <i class="fa-brands fa-linkedin"></i>
            </a>
            <a href="mailto:987.liara@gmail.com" aria-label="Email" class="social-link">
              <i class="fa-regular fa-envelope"></i>
            </a>
            <a
              href="https://instagram.com/liara_programadora/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              class="social-link"
            >
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a
              href="https://youtube.com/@LiaraProgramadora"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              class="social-link"
            >
              <i class="fa-brands fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container footer-bottom-inner">
          <span class="muted footer-copy">
            © {{ year }} Liara Store · Feito com 💜 por
            <a
              href="https://linkedin.com/in/liara-programadora"
              target="_blank"
              rel="noopener noreferrer"
            >Liara</a>
          </span>
          <span class="muted footer-pix">Pagamentos via PIX · Retirada presencial</span>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .skip {
      position: absolute;
      left: -999px;
      top: 0;
      background: var(--brand);
      color: #fff;
      padding: 0.75rem 1.25rem;
      z-index: 100;
    }
    .skip:focus {
      left: 0;
    }

    /* ===== TOPBAR ===== */
    .topbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding-top: env(safe-area-inset-top);
      transition:
        background-color 0.25s ease,
        border-color 0.25s ease;
    }

    .bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-height: 60px;
      padding: 0.4rem 0;
    }

    /* Logo */
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      flex-shrink: 0;
      text-decoration: none;
      min-height: var(--tap);
    }
    .logo-img {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
    .logo-text {
      font-size: var(--text-lead);
      font-weight: 800;
      color: var(--brand);
      white-space: nowrap;
    }
    @media (max-width: 380px) {
      .logo-text {
        display: none;
      }
    }

    /* Busca */
    .header-search {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      min-width: 0;
    }
    .search-icon {
      position: absolute;
      left: 0.75rem;
      color: var(--muted);
      pointer-events: none;
    }
    .header-search-input {
      width: 100%;
      min-height: 40px;
      padding: 0.45rem 2.5rem 0.45rem 2.4rem;
      border: 1.5px solid var(--border-dark);
      border-radius: 999px;
      font-size: 0.93rem;
      background: var(--surface-2);
      color: var(--ink);
      transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease,
        background 0.15s ease;
    }
    .header-search-input:focus {
      outline: none;
      border-color: var(--brand);
      box-shadow: 0 0 0 3px var(--brand-soft);
      background: var(--surface);
    }
    .header-search-input::placeholder {
      color: var(--muted);
    }
    .search-clear {
      position: absolute;
      right: 0.6rem;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--muted);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      padding: 0;
      transition:
        color 0.15s ease,
        background 0.15s ease;
    }
    .search-clear:hover {
      color: var(--ink);
      background: var(--border);
    }

    /* Controles direita */
    .nav-controls {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      flex-shrink: 0;
    }

    /* Toggle tema */
    .theme-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border: 1px solid var(--border);
      border-radius: 50%;
      background: var(--surface-2);
      color: var(--ink);
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
      transition:
        background 0.15s ease,
        border-color 0.15s ease,
        transform 0.25s ease;
    }
    .theme-btn:hover {
      background: var(--brand-soft);
      border-color: var(--brand);
      transform: rotate(22deg);
    }

    /* Carrinho */
    .cart-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border: 1px solid var(--border);
      border-radius: 50%;
      background: var(--surface-2);
      color: var(--ink);
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
      transition:
        background 0.15s ease,
        border-color 0.15s ease,
        color 0.25s ease,
        transform 0.25s ease;
    }
    .cart-btn:hover {
      background: var(--brand-soft);
      border-color: var(--brand);
      transform: translateY(-3px);
    }
    .cart-icon-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .cart-icon {
      display: block;
    }
    .count {
      position: absolute;
      top: -6px;
      right: -8px;
      background: var(--brand);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 800;
      line-height: 1;
      min-width: 16px;
      height: 16px;
      padding: 0 3px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cart-text {
      white-space: nowrap;
    }
    @media (max-width: 560px) {
      .cart-text {
        display: none;
      }
    }

    /* Content */
    .content {
      padding: 1.5rem 0 3rem;
      min-height: 100svh;
    }

    /* Footer */
    .footer {
      border-top: 1px solid var(--border);
      background: var(--surface-2);
      padding-top: 2rem;
      transition: background 0.25s ease, border-color 0.25s ease;
    }
    .footer-inner {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 2rem;
      padding-bottom: 2rem;
      flex-wrap: wrap;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .footer-logo {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
    .footer-name {
      margin: 0 0 0.1rem;
      font-size: var(--text-lead);
      font-weight: 800;
      color: var(--brand);
    }
    .footer-tagline {
      margin: 0;
      font-size: 0.82rem;
      color: var(--muted);
    }
    .footer-links {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.6rem;
    }
    @media (max-width: 560px) {
      .footer-inner {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .footer-links {
        align-items: center;
      }
    }
    .footer-follow {
      margin: 0;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
    }
    .social-icons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .social-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1px solid var(--border-dark);
      background: var(--surface);
      color: var(--muted);
      font-size: 1rem;
      text-decoration: none;
      transition:
        color 0.2s ease,
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
    }
    .social-link:hover {
      color: var(--brand-dark);
      background: var(--brand-soft);
      border-color: var(--brand);
      transform: translateY(-2px);
    }
    .footer-bottom {
      border-top: 1px solid var(--border);
      padding: 0.9rem 0 calc(0.9rem + env(safe-area-inset-bottom));
    }
    .footer-bottom-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .footer-copy {
      font-size: 0.8rem;
    }
    .footer-copy a {
      color: var(--brand);
      font-weight: 600;
      text-decoration: none;
    }
    .footer-copy a:hover {
      text-decoration: underline;
    }
    .footer-pix {
      font-size: 0.78rem;
    }
    @media (max-width: 560px) {
      .footer-bottom-inner {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }
  `,
})
export class App {
  protected readonly cart = inject(CartService);
  protected readonly search = inject(SearchService);
  protected readonly theme = inject(ThemeService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  protected readonly t = this.i18n.t;
  protected readonly year = new Date().getFullYear();

  protected readonly isHome = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects === '/'),
      startWith(this.router.url === '/'),
    ),
    { initialValue: this.router.url === '/' },
  );

  protected readonly cartLabel = computed(() =>
    this.cart.count() > 0 ? this.t().cartCount(this.cart.count()) : this.t().cartEmpty,
  );

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }
}
