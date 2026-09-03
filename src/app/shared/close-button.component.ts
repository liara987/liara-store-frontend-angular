import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-close-button',
  standalone: true,
  template: `
    <button class="close-btn" type="button" aria-label="Fechar" (click)="close.emit()">
      <svg viewBox="0 0 24 24" fill="none">
        <line x1="4" y1="4" x2="20" y2="20"></line>
        <line x1="20" y1="4" x2="4" y2="20"></line>
      </svg>
    </button>
  `,
  styles: [
    `
      :host {
        --btn-size: 56px;
        --icon-size: 20px;
        --surface: rgba(48, 17, 17, 0);
        --surface-active: rgba(211, 73, 200, 0.5);
        --line-color: rgba(10, 10, 10, 0.72);
        --danger: #ff5f56;
        display: inline-block;
      }

      * {
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
      }

      .close-btn {
        position: relative;
        width: var(--btn-size);
        height: var(--btn-size);
        border: none;
        border-radius: 50%;
        background: var(--surface);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        touch-action: manipulation;
        transition:
          background 0.2s ease,
          transform 0.2s ease;
      }

      .close-btn::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: var(--danger);
        opacity: 0;
        transform: scale(0.4);
        transition:
          opacity 0.25s ease,
          transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .close-btn::before {
        content: '';
        position: absolute;
        inset: -6px;
      }

      .close-btn svg {
        position: relative;
        width: var(--icon-size);
        height: var(--icon-size);
        z-index: 1;
      }

      .close-btn svg line {
        stroke: var(--line-color);
        stroke-width: 2.25;
        stroke-linecap: round;
        transform-origin: center;
        transition:
          transform 0.2s ease,
          stroke 0.2s ease;
      }

      .close-btn:active {
        background: var(--surface-active);
        transform: scale(0.94);
      }

      .close-btn:active::after {
        opacity: 1;
        transform: scale(1);
      }

      .close-btn:active svg line {
        stroke: #000;
      }

      .close-btn:active svg line:nth-child(1) {
        transform: rotate(90deg) scale(0.85);
      }

      .close-btn:active svg line:nth-child(2) {
        transform: rotate(0deg) scale(0.85);
      }

      @media (hover: hover) and (pointer: fine) {
        .close-btn:hover {
          background: var(--surface-active);
        }
      }

      .close-btn:focus-visible {
        outline: 2px solid #64b5f6;
        outline-offset: 4px;
      }
    `,
  ],
})
export class CloseButtonComponent {
  @Output() close = new EventEmitter<void>();
}
