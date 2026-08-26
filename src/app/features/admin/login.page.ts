import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  template: `
    <form class="card login" [formGroup]="form" (ngSubmit)="submit()">
      <h1>Área administrativa</h1>

      <div class="field">
        <label for="email">E-mail</label>
        <input id="email" type="email" formControlName="email" autocomplete="username" />
      </div>

      <div class="field">
        <label for="password">Senha</label>
        <input
          id="password"
          type="password"
          formControlName="password"
          autocomplete="current-password"
        />
      </div>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      <button class="btn submit" type="submit" [disabled]="submitting()">Entrar</button>
    </form>
  `,
  styles: `
    .login {
      max-width: 380px;
      margin: 3rem auto;
    }
    @media (max-width: 480px) {
      .login {
        margin: 1.5rem auto;
      }
    }
    h1 {
      font-size: 1.2rem;
      margin-top: 0;
    }
    .submit {
      width: 100%;
      margin-top: 1.2rem;
    }
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);

    this.auth.login(email, password).subscribe({
      next: () => void this.router.navigate(['/admin/dashboard']),
      error: (response: HttpErrorResponse) => {
        this.error.set(
          response.status === 401
            ? 'E-mail ou senha inválidos.'
            : 'Não foi possível entrar. Tente novamente.',
        );
        this.submitting.set(false);
      },
    });
  }
}
