import { CanActivateFn, Router } from '@angular/router';
import { SignalrService } from '../services/signalr.service';
import { inject } from '@angular/core';

export const orderCompleteGuard: CanActivateFn = (route, state) => {
  const signalrService = inject(SignalrService);
  const router = inject(Router);

  if (!signalrService.orderSignal()) {
    router.navigateByUrl('/shop');
    return false;
  }

  return true;
};
