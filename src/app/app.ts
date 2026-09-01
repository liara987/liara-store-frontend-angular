import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CartService } from './core/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <a class="skip" href="#conteudo">Ir para o conteúdo</a>

    <header class="topbar">
      <div class="container bar">
        <a routerLink="/" class="logo">
          <img
            class="logo-img"
            src="https://res.cloudinary.com/jebe8tbc/image/upload/v1788214399/liara-store-logo.png"
            alt=""
          />
          <span>Liara Store</span>
        </a>
        <nav>
          <a routerLink="/carrinho" class="cart-link" [attr.aria-label]="cartLabel()">
            Carrinho
            @if (cart.count() > 0) {
              <span class="count" aria-hidden="true">{{ cart.count() }}</span>
            }
          </a>
        </nav>
      </div>
    </header>

    <main id="conteudo" class="container content">
      <router-outlet />
    </main>

    <footer class="container footer muted flex-col">
      <span>Me siga nas redes sociais!</span>
      <div class="social-icons">
        <!-- LinkedIn -->
        <a
          href="https://linkedin.com/in/liara-programadora"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <i class="fa-brands fa-linkedin"></i>
        </a>

        <!-- Email -->
        <a href="mailto:987.liara@gmail.com" aria-label="Email">
          <i class="fa-regular fa-envelope"></i>
        </a>

        <!-- Instagram -->
        <a
          href="https://instagram.com/liara_programadora/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <i class="fa-brands fa-instagram"></i>
        </a>

        <!-- YouTube -->
        <a
          href="https://youtube.com/@LiaraProgramadora"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <i class="fa-brands fa-youtube"></i>
        </a>
      </div>
    </footer>
  `,
  styles: `
    .logo-img {
      width: 64px;
      height: 64px;
      margin-right: 0.5rem;
    }
    .skip {
      position: absolute;
      left: -999px;
      top: 0;
      background: var(--brand);
      color: #fff;
      padding: 0.75rem 1.25rem;
      z-index: 20;
    }
    .skip:focus {
      left: 0;
    }
    .topbar {
      position: sticky;
      top: 0;
      z-index: 10;
      background: #fff;
      border-bottom: 1px solid var(--border);
      padding-top: env(safe-area-inset-top);
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--gap-tap);
      min-height: 56px;
    }
    .logo,
    .cart-link {
      display: inline-flex;
      align-items: center;
      min-height: var(--tap);
      padding: 0 0.5rem;
      margin: 0 -0.5rem;
      font-weight: 700;
    }
    .logo {
      font-size: var(--text-lead);
      font-weight: 800;
      color: var(--brand);
      white-space: nowrap;
    }
    .count {
      display: inline-block;
      min-width: 1.5rem;
      text-align: center;
      background: var(--brand);
      color: #fff;
      border-radius: 999px;
      padding: 0.05rem 0.45rem;
      margin-left: 0.4rem;
    }
    /* Reserva a altura da janela para o rodape nao subir/descer enquanto os dados carregam. */
    .content {
      padding: 1.5rem 0 3rem;
      min-height: 100svh;
    }
    .footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      padding: 1.5rem 0 calc(1.5rem + env(safe-area-inset-bottom));
    }
    .footer a {
      display: inline-flex;
      align-items: center;
      min-height: var(--tap);
      font-weight: 600;
      text-decoration: underline;
    }
    .social-icons {
      display: flex;
      justify-content: center;
      gap: 12px;
      align-items: center;
    }
    .social-icons a {
      color: #555; /* cor que combine com seu site */
      font-size: 25px;
      text-decoration: none;
      transition:
        opacity 0.2s ease,
        transform 0.2s ease;
    }
    .social-icons a:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }
  `,
})
export class App {
  protected readonly cart = inject(CartService);

  protected readonly cartLabel = computed(() =>
    this.cart.count() > 0 ? `Carrinho com ${this.cart.count()} item(ns)` : 'Carrinho vazio',
  );
}
