import { Component, inject, OnDestroy } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { SignalrService } from '../../../core/services/signalr.service';
import { AddressPipe } from '../../../shared/pipes/address-pipe';
import { PaymentPipe } from '../../../shared/pipes/payment-pipe';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-checkout-success',
  imports: [
    MatButton,
    RouterLink,
    AddressPipe,
    PaymentPipe,
    DatePipe,
    CurrencyPipe,
    MatProgressSpinner,
  ],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.css',
})
export class CheckoutSuccessComponent implements OnDestroy {
  signalrService = inject(SignalrService);

  ngOnDestroy(): void {
    this.signalrService.orderSignal.set(null);
  }
}
