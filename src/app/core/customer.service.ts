import { Injectable } from '@angular/core';

export interface CustomerDetails {
  name: string;
  email: string;
}

const STORAGE_KEY = 'liara-store:customer';

/** Guarda nome e e-mail no navegador para pré-preencher o checkout nas próximas compras. */
@Injectable({ providedIn: 'root' })
export class CustomerService {
  read(): CustomerDetails {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = raw ? (JSON.parse(raw) as Partial<CustomerDetails>) : null;
      return { name: stored?.name ?? '', email: stored?.email ?? '' };
    } catch {
      return { name: '', email: '' };
    }
  }

  save(details: CustomerDetails): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } catch {
      // Modo privado do navegador pode bloquear a escrita; o checkout segue normalmente.
    }
  }
}
