import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isAdminRequest = request.url.startsWith(`${environment.apiUrl}/admin`);
  const token = auth.token;

  const authorized =
    isAdminRequest && token
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authorized).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isAdminRequest && error.status === 401 && auth.isAuthenticated()) {
        auth.logout();
        void router.navigate(['/admin/login']);
      }
      return throwError(() => error);
    }),
  );
};
