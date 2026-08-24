import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/admin.service';
import { Product } from '../../core/models';
import { CentsPipe } from '../../shared/cents.pipe';

@Component({
  selector: 'app-admin-products',
  imports: [ReactiveFormsModule, CentsPipe],
  template: `
    <div class="head">
      <h1>Produtos</h1>
      <button class="btn" (click)="showForm.set(!showForm())">
        {{ showForm() ? 'Fechar' : 'Novo produto' }}
      </button>
    </div>

    @if (showForm()) {
      <form class="card form" [formGroup]="form" (ngSubmit)="create()">
        <div class="row">
          <div class="field">
            <label for="name">Nome</label>
            <input id="name" formControlName="name" />
          </div>
          <div class="field">
            <label for="category">Categoria</label>
            <input id="category" formControlName="category" />
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label for="price">Preço (R$)</label>
            <input id="price" type="number" step="0.01" min="0" formControlName="price" />
          </div>
          <div class="field">
            <label for="stock">Estoque</label>
            <input id="stock" type="number" min="0" formControlName="stock" />
          </div>
        </div>
        <div class="field">
          <label for="description">Descrição</label>
          <textarea id="description" rows="3" formControlName="description"></textarea>
        </div>
        @if (formError()) {
          <p class="error">{{ formError() }}</p>
        }
        <button class="btn" type="submit" [disabled]="form.invalid">Cadastrar</button>
      </form>
    }

    @if (actionError()) {
      <p class="error">{{ actionError() }}</p>
    }

    @if (loading()) {
      <p class="muted">Carregando produtos…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else {
      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (product of products(); track product.id) {
              <tr>
                <td>
                  {{ product.name }}
                  <span class="muted block">{{ product.category }}</span>
                </td>
                <td>{{ product.price | cents }}</td>
                <td>
                  <input
                    class="stock"
                    type="number"
                    min="0"
                    [value]="product.stock"
                    (change)="setStock(product, $event)"
                  />
                </td>
                <td>
                  <span class="badge" [class.paid]="product.active">
                    {{ product.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="actions">
                  <label class="btn ghost small upload">
                    Imagem
                    <input type="file" accept="image/*" multiple (change)="upload(product, $event)" hidden />
                  </label>
                  @if (product.active) {
                    <button class="btn ghost small" (click)="deactivate(product)">Desativar</button>
                  } @else {
                    <button class="btn ghost small" (click)="reactivate(product)">Ativar</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: `
    .head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      font-size: 1.3rem;
    }
    .form {
      margin-bottom: 1rem;
    }
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.9rem;
    }
    .form .btn {
      margin-top: 1rem;
    }
    .stock {
      width: 5rem;
    }
    .actions {
      display: flex;
      gap: 0.4rem;
    }
    .upload {
      cursor: pointer;
    }
    .block {
      display: block;
      font-size: 0.8rem;
    }
  `,
})
export class ProductsPage {
  private readonly admin = inject(AdminService);
  private readonly fb = inject(FormBuilder);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly showForm = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['bottons', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    description: ['', Validators.required],
  });

  constructor() {
    this.load();
  }

  protected create(): void {
    const value = this.form.getRawValue();
    this.formError.set(null);

    this.admin
      .createProduct({
        name: value.name,
        category: value.category,
        description: value.description,
        stock: Number(value.stock),
        price: Math.round(Number(value.price) * 100),
        active: true,
      })
      .subscribe({
        next: () => {
          this.form.reset({ category: 'bottons', price: 0, stock: 0 });
          this.showForm.set(false);
          this.load();
        },
        error: (response: HttpErrorResponse) =>
          this.formError.set(
            response.error?.error?.message ?? 'Não foi possível cadastrar o produto.',
          ),
      });
  }

  protected setStock(product: Product, event: Event): void {
    const quantity = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(quantity) || quantity < 0) return;

    this.actionError.set(null);
    this.admin.updateStock(product.id, 'set', quantity).subscribe({
      next: () => this.load(),
      error: () => this.actionError.set('Não foi possível atualizar o estoque.'),
    });
  }

  protected upload(product: Product, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.actionError.set(null);
    this.admin.uploadImages(product.id, input.files).subscribe({
      next: () => {
        input.value = '';
        this.load();
      },
      error: (response: HttpErrorResponse) => {
        input.value = '';
        this.actionError.set(
          response.error?.error?.message ??
            'Falha no upload. Verifique a configuração do Cloudinary.',
        );
      },
    });
  }

  protected deactivate(product: Product): void {
    this.admin.deactivateProduct(product.id).subscribe({ next: () => this.load() });
  }

  protected reactivate(product: Product): void {
    this.admin.updateProduct(product.id, { active: true }).subscribe({ next: () => this.load() });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.admin.products().subscribe({
      next: (response) => {
        this.products.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os produtos.');
        this.loading.set(false);
      },
    });
  }
}
