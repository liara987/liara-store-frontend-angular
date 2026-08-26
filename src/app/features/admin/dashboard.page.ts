import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AdminService } from '../../core/admin.service';
import { Dashboard } from '../../core/models';
import { CentsPipe } from '../../shared/cents.pipe';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe, CentsPipe],
  template: `
    @if (loading()) {
      <p class="muted">Carregando dashboard…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (data(); as dashboard) {
      <div class="kpis">
        <div class="card kpi">
          <span class="muted">Total vendido hoje</span>
          <strong>{{ dashboard.today.totalSold | cents }}</strong>
        </div>
        <div class="card kpi">
          <span class="muted">Vendas hoje</span>
          <strong>{{ dashboard.today.salesCount }}</strong>
        </div>
        <div class="card kpi">
          <span class="muted">Estoque baixo (≤ {{ dashboard.lowStockThreshold }})</span>
          <strong>{{ dashboard.lowStockProducts.length }}</strong>
        </div>
      </div>

      <div class="cols">
        <section class="card">
          <h2>Produtos com estoque baixo</h2>
          @if (dashboard.lowStockProducts.length === 0) {
            <p class="muted">Nenhum produto com estoque baixo.</p>
          } @else {
            <table>
              <tbody>
                @for (product of dashboard.lowStockProducts; track product.id) {
                  <tr>
                    <td>{{ product.name }}</td>
                    <td class="right">{{ product.stock }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </section>

        <section class="card">
          <h2>Vendas recentes</h2>
          @if (dashboard.recentSales.length === 0) {
            <p class="muted">Nenhuma venda confirmada ainda.</p>
          } @else {
            <table>
              <tbody>
                @for (sale of dashboard.recentSales; track sale.id) {
                  <tr>
                    <td>
                      {{ sale.customerName }}
                      <span class="muted block">
                        {{ sale.itemsCount }} item(ns) ·
                        {{ sale.paidAt | date: 'dd/MM HH:mm' }}
                      </span>
                    </td>
                    <td class="right">{{ sale.total | cents }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </section>
      </div>
    }
  `,
  styles: `
    .kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .kpi {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .kpi strong {
      font-size: 1.6rem;
      color: var(--brand-dark);
    }
    .cols {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1rem;
    }
    h2 {
      font-size: 1.05rem;
      margin-top: 0;
    }
    .right {
      text-align: right;
      white-space: nowrap;
    }
    table td:first-child {
      word-break: break-word;
    }
    .block {
      display: block;
      font-size: 0.8rem;
    }
  `,
})
export class DashboardPage {
  private readonly admin = inject(AdminService);

  protected readonly data = signal<Dashboard | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.admin.dashboard().subscribe({
      next: (dashboard) => {
        this.data.set(dashboard);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar o dashboard.');
        this.loading.set(false);
      },
    });
  }
}
