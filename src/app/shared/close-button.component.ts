import { Component, input, output } from '@angular/core';

/**
 * Botão circular de fechar ("X"), reutilizável em drawers, modais e banners.
 * Uso: <app-close-button (closed)="cart.close()" />
 */
@Component({
  selector: 'app-close-button',
  template: `
    <button type="button" class="close-btn" [attr.aria-label]="label()" (click)="closed.emit()">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  `,
  styles: `
    :host {
      display: contents;
    }
    .close-btn {
      background: red;
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--tap, 44px);
      height: var(--tap, 44px);
      padding: 0;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: var(--ink);
      cursor: pointer;
      transition:
        background-color 0.15s ease,
        color 0.15s ease;
    }
    .close-btn:hover {
      background: var(--surface-2);
    }
    .close-btn:active {
      background: var(--border);
    }
    .close-btn:focus-visible {
      outline: 2px solid var(--brand);
      outline-offset: 2px;
    }
  `,
})
export class CloseButtonComponent {
  /** Texto de acessibilidade do botão; pode ser customizado pelo pai (ex.: "Fechar carrinho"). */
  readonly label = input<string>('Fechar');

  /** Emitido quando o botão interno é clicado. */
  readonly closed = output<void>();
}
