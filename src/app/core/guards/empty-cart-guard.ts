import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { CartService } from '../services/cart.service';
import { SnackBarService } from '../services/snack-bar.service';

export const emptyCartGuard: CanActivateFn = (route, state) => {
  const cartService = inject(CartService);
  const snackBar = inject(SnackBarService);

  if (!cartService.cart() || cartService.cart()?.items.length === 0) {
    snackBar.error('Your cart is empty');
    return false;
  }
  return true;
};
