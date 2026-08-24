import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CartService } from './core/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="topbar">
      <div class="container bar">
        <a routerLink="/" class="logo">Liara Store</a>
        <nav>
          <a routerLink="/carrinho" class="cart-link">
            Carrinho
            @if (cart.count() > 0) {
              <span class="count">{{ cart.count() }}</span>
            }
          </a>
        </nav>
      </div>
    </header>

    <main class="container content">
      <router-outlet />
    </main>

    <footer class="container footer muted">
      Liara Store — bottons e produtos personalizados ·
      <a routerLink="/admin">Área administrativa</a>
    </footer>
  `,
  styles: `
    .topbar {
      background: #fff;
      border-bottom: 1px solid var(--border);
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.9rem 0;
    }
    .logo {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--brand);
    }
    .cart-link {
      font-weight: 600;
    }
    .count {
      display: inline-block;
      min-width: 1.4rem;
      text-align: center;
      background: var(--brand);
      color: #fff;
      border-radius: 999px;
      font-size: 0.75rem;
      padding: 0.05rem 0.4rem;
      margin-left: 0.25rem;
    }
    .content {
      padding: 1.5rem 0 3rem;
      min-height: 60vh;
    }
    .footer {
      padding: 1.5rem 0;
      font-size: 0.85rem;
    }
  `,
})
export class App {
  protected readonly cart = inject(CartService);
}
