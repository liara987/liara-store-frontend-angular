import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-head">
      <nav aria-label="Navegação administrativa">
        <a routerLink="dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="produtos" routerLinkActive="active">Produtos</a>
        <a routerLink="pedidos" routerLinkActive="active">Pedidos</a>
      </nav>
      <div class="who">
        <span class="muted">{{ auth.session()?.admin?.name }}</span>
        <button class="btn ghost small" (click)="logout()">Sair</button>
      </div>
    </div>

    <router-outlet />
  `,
  styles: `
    .admin-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }
    nav {
      display: flex;
      flex-wrap: wrap;
      gap: var(--gap-tap);
    }
    nav a {
      display: inline-flex;
      align-items: center;
      min-height: var(--tap);
      padding: 0 0.5rem;
      font-weight: 600;
      border-bottom: 3px solid transparent;
    }
    nav a.active {
      color: var(--brand-dark);
      border-color: var(--brand);
    }
    .who {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--gap-tap);
    }
  `,
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/admin/login']);
  }
}
