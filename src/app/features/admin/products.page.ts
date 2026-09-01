import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { AdminService } from '../../core/admin.service';
import { Product } from '../../core/models';
import { CentsPipe } from '../../shared/cents.pipe';

interface SelectedImage {
  file: File;
  url: string;
}

@Component({
  selector: 'app-admin-products',
  imports: [ReactiveFormsModule, CentsPipe],
  template: `
    <div class="head">
      <h1>Produtos</h1>
      <button class="btn" (click)="showForm() ? closeForm() : openCreate()">
        {{ showForm() ? 'Fechar' : 'Novo produto' }}
      </button>
    </div>

    @if (showForm()) {
      <section class="card form" role="region" [attr.aria-label]="formTitle()">
        <h2>{{ formTitle() }}</h2>

        <div class="split">
          <form [formGroup]="form" (ngSubmit)="submit()">
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
                <input
                  id="price"
                  type="number"
                  inputmode="decimal"
                  step="0.01"
                  min="0"
                  formControlName="price"
                />
              </div>
              <div class="field">
                <label for="stock">Estoque</label>
                <input
                  id="stock"
                  type="number"
                  inputmode="numeric"
                  min="0"
                  formControlName="stock"
                />
              </div>
            </div>
            <div class="field">
              <label for="description">Descrição</label>
              <textarea id="description" rows="3" formControlName="description"></textarea>
            </div>

            <div class="field">
              <label for="images">Imagens</label>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                (change)="selectImages($event)"
              />
              @if (selectedImages().length > 0) {
                <p class="muted hint">
                  {{ selectedImages().length }} imagem(ns) selecionada(s); o envio começa após
                  salvar.
                </p>
              }
            </div>

            @if (uploadProgress() !== null) {
              <div class="progress">
                <div
                  class="bar"
                  role="progressbar"
                  aria-label="Progresso do upload de imagens"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  [attr.aria-valuenow]="uploadProgress()"
                  [style.width.%]="uploadProgress()"
                ></div>
              </div>
              <p class="muted" role="status">Enviando imagens… {{ uploadProgress() }}%</p>
            }

            @if (formError()) {
              <p class="error" role="alert">{{ formError() }}</p>
            }

            <div class="form-actions">
              <button class="btn" type="submit" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Salvando…' : editing() ? 'Salvar alterações' : 'Cadastrar' }}
              </button>
              <button class="btn ghost" type="button" (click)="closeForm()">Cancelar</button>
            </div>
          </form>

          <aside class="preview" aria-label="Pré-visualização do produto">
            <p class="muted preview-title">Como o cliente verá:</p>
            <article class="card product">
              @if (previewImage(); as image) {
                <img [src]="image" alt="" width="400" height="400" />
              } @else {
                <div class="placeholder" aria-hidden="true">sem imagem</div>
              }
              <h3>{{ preview().name || 'Nome do produto' }}</h3>
              <p class="muted category">{{ preview().category || 'categoria' }}</p>
              <p class="price">{{ previewPrice() | cents }}</p>
              @if (preview().stock > 0) {
                <button class="btn block" type="button" disabled>Adicionar ao carrinho</button>
              } @else {
                <button class="btn block" type="button" disabled>Esgotado</button>
              }
              <p class="muted description">{{ preview().description }}</p>
            </article>
          </aside>
        </div>
      </section>
    }

    @if (actionError()) {
      <p class="error" role="alert">{{ actionError() }}</p>
    }
    @if (actionSuccess()) {
      <p class="success" role="status">{{ actionSuccess() }}</p>
    }

    @if (loading()) {
      <p class="muted">Carregando produtos…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else {
      <div class="card">
        <table class="responsive-table">
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
                <td data-label="Produto">
                  <span>
                    {{ product.name }}
                    <span class="muted block">{{ product.category }}</span>
                  </span>
                </td>
                <td data-label="Preço">{{ product.price | cents }}</td>
                <td data-label="Estoque">
                  <input
                    class="stock"
                    type="number"
                    inputmode="numeric"
                    min="0"
                    [value]="product.stock"
                    [attr.aria-label]="'Estoque de ' + product.name"
                    (change)="setStock(product, $event)"
                  />
                </td>
                <td data-label="Status">
                  <span class="badge" [class.paid]="product.active">
                    {{ product.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="actions" data-label="Ações">
                  <button class="btn ghost small" (click)="openEdit(product)">
                    Editar<span class="sr-only"> {{ product.name }}</span>
                  </button>
                  @if (product.active) {
                    <button class="btn ghost small" (click)="deactivate(product)">
                      Desativar<span class="sr-only"> {{ product.name }}</span>
                    </button>
                  } @else {
                    <button class="btn ghost small" (click)="reactivate(product)">
                      Ativar<span class="sr-only"> {{ product.name }}</span>
                    </button>
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
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: var(--gap-tap);
    }
    h1 {
      font-size: var(--text-title);
    }
    h2 {
      font-size: var(--text-lead);
      margin-top: 0;
    }
    .form {
      margin-bottom: 1rem;
    }
    .split {
      display: grid;
      grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
      gap: 1.5rem;
      align-items: start;
    }
    @media (max-width: 860px) {
      .split {
        grid-template-columns: 1fr;
      }
    }
    .field {
      margin-top: 1rem;
    }
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
      gap: 0.9rem;
    }
    .hint {
      margin: 0.35rem 0 0;
    }
    .form-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--gap-tap);
      margin-top: 1rem;
    }
    .progress {
      height: 10px;
      border-radius: 999px;
      background: var(--brand-soft);
      overflow: hidden;
      margin-top: 1rem;
    }
    .progress .bar {
      height: 100%;
      background: var(--brand);
      transition: width 0.2s ease;
    }
    .success {
      color: var(--ok);
      font-weight: 600;
    }
    .preview-title {
      margin: 0 0 0.5rem;
    }
    .preview img,
    .preview .placeholder {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 10px;
      background: #f4eae6;
    }
    .preview .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
    }
    .preview h3 {
      font-size: var(--text-body);
      margin: 0.6rem 0 0.2rem;
    }
    .preview .category {
      margin: 0 0 0.4rem;
    }
    .preview .price {
      margin: 0 0 0.9rem;
      font-size: var(--text-lead);
      font-weight: 700;
      color: var(--brand-dark);
    }
    .preview .description {
      margin: 0.75rem 0 0;
    }
    .stock {
      width: 6rem;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--gap-tap);
    }
    .block {
      display: block;
    }
    @media (max-width: 900px) {
      .actions {
        justify-content: flex-end;
      }
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
  protected readonly actionSuccess = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly showForm = signal(false);
  protected readonly editing = signal<Product | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploadProgress = signal<number | null>(null);
  protected readonly selectedImages = signal<SelectedImage[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['bottons', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    description: ['', Validators.required],
  });

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: {} });
  protected readonly preview = computed(() => ({
    ...this.form.getRawValue(),
    ...this.formValue(),
  }));

  protected readonly formTitle = computed(() =>
    this.editing() ? `Editar ${this.editing()?.name}` : 'Novo produto',
  );
  protected readonly previewPrice = computed(() => Math.round(Number(this.preview().price) * 100));
  protected readonly previewImage = computed(
    () => this.selectedImages()[0]?.url ?? this.editing()?.images[0]?.url ?? null,
  );

  constructor() {
    this.load();
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.resetForm();
    this.showForm.set(true);
  }

  protected openEdit(product: Product): void {
    this.editing.set(product);
    this.resetForm();
    this.form.setValue({
      name: product.name,
      category: product.category,
      price: product.price / 100,
      stock: product.stock,
      description: product.description,
    });
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
    this.resetForm();
  }

  protected selectImages(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.revokePreviews();
    this.selectedImages.set(
      Array.from(input.files ?? []).map((file) => ({ file, url: URL.createObjectURL(file) })),
    );
  }

  protected submit(): void {
    const value = this.form.getRawValue();
    const payload = {
      name: value.name,
      category: value.category,
      description: value.description,
      stock: Number(value.stock),
      price: Math.round(Number(value.price) * 100),
      active: this.editing()?.active ?? true,
    };
    const target = this.editing();

    this.formError.set(null);
    this.saving.set(true);
    const imagesCount = this.selectedImages().length;

    const save: Observable<Product> = target
      ? this.admin.updateProduct(target.id, payload)
      : this.admin.createProduct(payload);

    save.pipe(switchMap((product) => this.uploadSelectedImages(product))).subscribe({
      next: (product) => {
        this.saving.set(false);
        this.uploadProgress.set(null);
        const saved = target ? 'atualizado' : 'cadastrado';
        const images = imagesCount > 0 ? ` ${imagesCount} imagem(ns) enviada(s).` : '';
        this.actionSuccess.set(`Produto “${product.name}” ${saved}.${images}`);
        this.actionError.set(null);
        this.closeForm();
        this.load();
      },
      error: (response: HttpErrorResponse) => {
        this.saving.set(false);
        this.uploadProgress.set(null);
        this.formError.set(
          response.error?.error?.message ??
            (imagesCount > 0
              ? 'Falha no envio das imagens. Verifique a configuração do Cloudinary.'
              : 'Não foi possível salvar o produto.'),
        );
      },
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

  protected deactivate(product: Product): void {
    this.admin.deactivateProduct(product.id).subscribe({ next: () => this.load() });
  }

  protected reactivate(product: Product): void {
    this.admin.updateProduct(product.id, { active: true }).subscribe({ next: () => this.load() });
  }

  /** Envia as imagens escolhidas no formulário, alimentando a barra de progresso. */
  private uploadSelectedImages(product: Product): Observable<Product> {
    const files = this.selectedImages().map((image) => image.file);
    if (files.length === 0) return of(product);

    this.uploadProgress.set(0);

    return new Observable<Product>((subscriber) => {
      const subscription = this.admin.uploadImages(product.id, files).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress.set(Math.round((event.loaded / event.total) * 100));
          } else if (event.type === HttpEventType.Response) {
            this.uploadProgress.set(100);
            subscriber.next(event.body ?? product);
            subscriber.complete();
          }
        },
        error: (response: unknown) => subscriber.error(response),
      });

      return () => subscription.unsubscribe();
    });
  }

  private resetForm(): void {
    this.form.reset({ category: 'bottons', price: 0, stock: 0 });
    this.formError.set(null);
    this.uploadProgress.set(null);
    this.revokePreviews();
    this.selectedImages.set([]);
  }

  private revokePreviews(): void {
    this.selectedImages().forEach((image) => URL.revokeObjectURL(image.url));
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
