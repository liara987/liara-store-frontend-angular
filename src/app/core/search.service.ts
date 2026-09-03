import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
  readonly query = signal('');
  set(value: string): void { this.query.set(value); }
  clear(): void { this.query.set(''); }
}
