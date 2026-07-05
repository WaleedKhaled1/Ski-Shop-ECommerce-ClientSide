import { UpperCasePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { ConfirmationToken } from '@stripe/stripe-js';

@Pipe({
  name: 'payment',
})
export class PaymentPipe implements PipeTransform {
  transform(value?: ConfirmationToken['payment_method_preview'], ...args: unknown[]): unknown {
    if (value?.card) {
      return `${value.card.brand.toUpperCase()} **** **** **** ${value.card.last4}, EXP: ${value.card.exp_month}/${value.card.exp_year}`;
    } else return 'Unknown payment method';
  }
}
