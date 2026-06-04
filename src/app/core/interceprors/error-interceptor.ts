import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SnackBarService } from '../services/snack-bar.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const route = inject(Router);

  const snackBar = inject(SnackBarService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 500) {
        const navigationExtras: NavigationExtras = { state: { error: err.error } };
        route.navigateByUrl('/server-error', navigationExtras);
      }

      if (err.status === 400) {
        if (err.error.errors) {
          const modalStateErrors = [];
          for (const key in err.error.errors) {
            if (err.error.errors[key]) {
              modalStateErrors.push(err.error.errors[key]);
            }
          }
          throw modalStateErrors.flat();
        } else {
          snackBar.error(err.error.title || err.error);
        }
      }

      if (err.status === 401) {
        snackBar.error(err.error.title || err.error);
      }

      if (err.status === 404) {
        route.navigateByUrl('/not-found');
      }

      return throwError(() => err);
    }),
  );
};
