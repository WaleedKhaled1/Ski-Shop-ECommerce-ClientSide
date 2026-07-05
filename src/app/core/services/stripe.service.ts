import { inject, Injectable } from '@angular/core';
import {
  ConfirmationToken,
  loadStripe,
  Stripe,
  StripeAddressElement,
  StripeAddressElementOptions,
  StripeElements,
  StripePaymentElement,
} from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CartService } from './cart.service';
import { Cart } from '../../shared/models/cart';
import { map } from 'rxjs/internal/operators/map';
import { firstValueFrom } from 'rxjs';
import { AccountService } from './account.service';
@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripePromise?: Promise<Stripe | null>;
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private cartService = inject(CartService);
  private accountService = inject(AccountService);

  private elements?: StripeElements;
  private addressElement?: StripeAddressElement;
  private paymentElement?: StripePaymentElement;

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  getStripeInstance() {
    return this.stripePromise;
  }

  async createPaymentElement() {
    if (!this.paymentElement) {
      const elements = await this.initializeElements();

      if (elements) {
        this.paymentElement = elements.create('payment');
      } else throw new Error('Problem initializing Stripe Elements');
    }

    return this.paymentElement;
  }

  async createAddressElement() {
    if (!this.addressElement) {
      const elements = await this.initializeElements();

      const user = this.accountService.currentUser();
      let defaultValues: StripeAddressElementOptions['defaultValues'] = {};

      if (user) {
        defaultValues.name = `${user.firstName} ${user.lastName}`;
      }

      if (user?.address) {
        defaultValues.address = {
          line1: user.address.line1,
          line2: user.address.line2,
          city: user.address.city,
          state: user.address.state,
          country: user.address.country,
          postal_code: user.address.postalCode,
        };
      }

      if (elements) {
        const options: StripeAddressElementOptions = {
          mode: 'shipping',
          defaultValues,
        };

        this.addressElement = elements.create('address', options);
      } else {
        throw new Error('Stripe Elements has not been initialized');
      }
    }

    return this.addressElement;
  }

  async initializeElements() {
    if (!this.elements) {
      const stripe = await this.getStripeInstance();

      if (stripe) {
        const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());
        this.elements = stripe.elements({
          clientSecret: cart.clientSecret,
          appearance: { labels: 'floating' },
          locale: 'en',
        });
      } else {
        throw new Error('Stripe was not been loaded');
      }
    }

    return this.elements;
  }

  createOrUpdatePaymentIntent() {
    const cart = this.cartService.cart();

    if (!cart) {
      throw new Error('Problem with your cart');
    }

    return this.http.post<Cart>(`${this.baseUrl}payments/${cart.id}`, {}).pipe(
      map((cart) => {
        this.cartService.cart.set(cart);
        return cart;
      }),
    );
  }

  async createConfirmationToken() {
    const stripe = await this.getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe was not been loaded');
    }

    const elements = await this.initializeElements();
    if (!elements) {
      throw new Error('Stripe Elements has not been initialized');
    }

    const result = await elements.submit();

    if (result.error) {
      throw new Error(result.error.message);
    }

    return await stripe.createConfirmationToken({ elements });
  }

  async confirmPayment(confirmationToken: ConfirmationToken) {
    const stripe = await this.getStripeInstance();
    const elements = await this.initializeElements();
    const clientSecret = this.cartService.cart()?.clientSecret;
    const result = await elements.submit();

    if (result.error) {
      throw new Error(result.error.message);
    }

    if (stripe && clientSecret) {
      return await stripe.confirmPayment({
        clientSecret: clientSecret,
        confirmParams: {
          confirmation_token: confirmationToken.id,
        },
        redirect: 'if_required',
      });
    } else {
      throw new Error('unable to load stripe');
    }
  }

  destroyElements() {
    this.elements = undefined;
    this.addressElement = undefined;
  }
}
