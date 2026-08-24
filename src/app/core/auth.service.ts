import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminSession } from './models';

const STORAGE_KEY = 'liara-store:admin-session';

function restore(): AdminSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionSignal = signal<AdminSession | null>(restore());

  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);

  get token(): string | null {
    return this.sessionSignal()?.accessToken ?? null;
  }

  login(email: string, password: string): Observable<AdminSession> {
    return this.http
      .post<AdminSession>(`${environment.apiUrl}/admin/auth/login`, { email, password })
      .pipe(
        tap((session) => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
          this.sessionSignal.set(session);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.sessionSignal.set(null);
  }
}
