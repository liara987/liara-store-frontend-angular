import { Injectable } from '@angular/core';

export interface LastOrder {
  id: string;
  customerName: string;
  total: number;
  createdAt: string;
  status: string;
}

const STORAGE_KEY = 'liara-store:last-order';

@Injectable({ providedIn: 'root' })
export class LastOrderService {
  /** Salva o último pedido no localStorage. Chame assim que o pedido for criado. */
  save(order: LastOrder): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    } catch {
      // localStorage indisponível — ignora silenciosamente
    }
  }

  /** Retorna o último pedido salvo, ou null se não houver. */
  read(): LastOrder | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as LastOrder) : null;
    } catch {
      return null;
    }
  }

  /** Remove o registro do último pedido. */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignora
    }
  }
}
