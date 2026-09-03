import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from './models';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  /** Preço em centavos apenas para exibição: o total oficial vem do backend. */
  price: number;
  quantity: number;
  imageUrl?: string;
  stock: number;
}

const STORAGE_KEY = 'liara-store:cart';

function restore(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSignal = signal<CartItem[]>(restore());
  /** Controla o menu lateral (drawer) de carrinho rápido; não afeta a página /carrinho. */
  private readonly openSignal = signal(false);

  readonly items = this.itemsSignal.asReadonly();
  readonly count = computed(() => this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  readonly isEmpty = computed(() => this.itemsSignal().length === 0);
  readonly isOpen = this.openSignal.asReadonly();

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.itemsSignal()));
    });
  }

  open(): void {
    this.openSignal.set(true);
  }

  close(): void {
    this.openSignal.set(false);
  }

  toggle(): void {
    this.openSignal.update((open) => !open);
  }

  add(product: Product, quantity = 1): void {
    this.itemsSignal.update((items) => {
      const existing = items.find((item) => item.productId === product.id);

      if (existing) {
        return items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item,
        );
      }

      return [
        ...items,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          quantity: Math.min(quantity, product.stock),
          imageUrl: product.images[0]?.url,
          stock: product.stock,
        },
      ];
    });
  }

  setQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }

    this.itemsSignal.update((items) =>
      items.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item,
      ),
    );
  }

  remove(productId: string): void {
    this.itemsSignal.update((items) => items.filter((item) => item.productId !== productId));
  }

  clear(): void {
    this.itemsSignal.set([]);
  }
}
