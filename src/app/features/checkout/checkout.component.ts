import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { OrderSummaryComponent } from '../cart/order-summary/order-summary.component';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { StripeService } from '../../core/services/stripe.service';
import {
  ConfirmationToken,
  StripeAddressElement,
  StripeAddressElementChangeEvent,
  StripePaymentElement,
  StripePaymentElementChangeEvent,
} from '@stripe/stripe-js';
import { SnackBarService } from '../../core/services/snack-bar.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AccountService } from '../../core/services/account.service';
import { firstValueFrom } from 'rxjs';
import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { CheckoutReviewComponent } from './checkout-review/checkout-review.component';
import { CartService } from '../../core/services/cart.service';
import { CurrencyPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Address } from '../../shared/models/user';
import { CreateOrderDto, ShippingAddress } from '../../shared/models/order';
import { OrderService } from '../../core/services/order.service';
@Component({
  selector: 'app-checkout',
  imports: [
    OrderSummaryComponent,
    MatStepperModule,
    RouterLink,
    MatButton,
    MatCheckboxModule,
    CheckoutDeliveryComponent,
    CheckoutReviewComponent,
    CurrencyPipe,
    MatProgressSpinnerModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  stripeService = inject(StripeService);
  accountService = inject(AccountService);
  cartService = inject(CartService);
  snackBarService = inject(SnackBarService);
  orderService = inject(OrderService);
  router = inject(Router);

  addressElement?: StripeAddressElement;
  paymentElement?: StripePaymentElement;

  saveAddress = false;
  completionState = signal<{ address: boolean; payment: boolean; delivery: boolean }>({
    address: false,
    payment: false,
    delivery: false,
  });
  confirmationToken?: ConfirmationToken;
  loading: boolean = false;

  ngOnDestroy(): void {
    this.stripeService.destroyElements();
  }

  async ngOnInit() {
    try {
      this.addressElement = await this.stripeService.createAddressElement();
      this.addressElement.mount('#address-element');
      this.addressElement.on('change', this.handleAddressChange);

      this.paymentElement = await this.stripeService.createPaymentElement();
      this.paymentElement.mount('#payment-element');
      this.paymentElement.on('change', this.handlePaymentChange);
    } catch (error: any) {
      this.snackBarService.error(error.message);
    }
  }

  onSaveAddressChange(event: MatCheckboxChange) {
    this.saveAddress = event.checked;
  }

  async onStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === 1) {
      if (this.saveAddress) {
        const address = (await this.getAddressFromAddressElement()) as Address;

        address && (await firstValueFrom(this.accountService.updateAddress(address)));
      }
    }

    if (event.selectedIndex === 2) {
      await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
    }

    if (event.selectedIndex === 3) {
      await this.getConfirmationToken();
    }
  }

  async getConfirmationToken() {
    try {
      const result = await this.stripeService.createConfirmationToken();

      if (result.error) throw new Error(result.error.message);

      this.confirmationToken = result.confirmationToken;
      console.log('Confirmation Token:', this.confirmationToken);
    } catch (error: any) {
      this.snackBarService.error(error.message);
    }
  }

  async confirmPayment(stepper: MatStepper) {
    this.loading = true;
    try {
      if (this.confirmationToken) {
        const result = await this.stripeService.confirmPayment(this.confirmationToken);
        if (result.paymentIntent?.status === 'succeeded') {
          const order = await this.createOrderModel();
          const orderResult = await firstValueFrom(this.orderService.createOrder(order));

          if (orderResult) {
            this.cartService.deleteCart();
            this.cartService.selectedDelivery.set(null);
            this.router.navigateByUrl('checkout-success');
          } else {
            throw new Error('Failed with order creation ');
          }
        } else if (result.error) {
          throw new Error(result.error.message);
        } else {
          throw new Error('Something went wrong!');
        }
      }
    } catch (error: any) {
      this.snackBarService.error(error.message || 'Somthing went wrong!');
      stepper.previous();
    } finally {
      this.loading = false;
    }
  }

  async createOrderModel(): Promise<CreateOrderDto> {
    const cart = this.cartService.cart();
    const shippingAddress = (await this.getAddressFromAddressElement()) as ShippingAddress;
    const card = this.confirmationToken?.payment_method_preview.card;

    if (!cart?.id || !cart.deliveryMethodId || !card || !shippingAddress)
      throw new Error('Problem with creating order model');

    return {
      cartId: cart.id,
      deliveryMethodId: cart.deliveryMethodId,
      shippingAddress: shippingAddress,
      paymentSummary: {
        last4: +card.last4,
        brand: card.brand,
        expMonth: card.exp_month,
        expYear: card.exp_year,
      },
    };
  }

  async getAddressFromAddressElement(): Promise<Address | null | ShippingAddress> {
    if (this.addressElement) {
      const result = await this.addressElement.getValue();
      if (result) {
        return {
          name: result.value.name,
          line1: result.value.address.line1,
          line2: result.value.address.line2 || undefined,
          city: result.value.address.city,
          state: result.value.address.state,
          country: result.value.address.country,
          postalCode: result.value.address.postal_code,
        };
      }
    }

    return null;
  }

  handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    this.completionState.update((state) => {
      state.address = event.complete;
      return state;
    });
  };

  handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
    this.completionState.update((state) => {
      state.payment = event.complete;
      return state;
    });
  };

  handleDeliveryChange = (isComplete: boolean) => {
    this.completionState.update((state) => {
      state.delivery = isComplete;
      return state;
    });
  };
}
