import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { inject } from '@angular/core';
import { map, of } from 'rxjs';
import { SnackBarService } from '../services/snack-bar.service';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const snackService = inject(SnackBarService);

  if (accountService.currentUser()) {
    return of(true);
  } else {
    return accountService.authState().pipe(
      map((auth) => {
        if (auth.isAuthenticated) {
          return true;
        } else {
          snackService.error('You must login to access this page!');
          router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }
      }),
    );
  }
};
