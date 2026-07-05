import { Component, inject, OnInit, output } from '@angular/core';
import { CheckoutService } from '../../../core/services/checkout.service';
import { MatRadioGroup, MatRadioModule } from '@angular/material/radio';
import { CurrencyPipe } from '@angular/common';
import { DeliveryMethod } from '../../../shared/models/deliveryMethod';
import { CartService } from '../../../core/services/cart.service';
@Component({
  selector: 'app-checkout-delivery',
  imports: [MatRadioModule, CurrencyPipe, MatRadioGroup],
  templateUrl: './checkout-delivery.component.html',
  styleUrl: './checkout-delivery.component.css',
})
export class CheckoutDeliveryComponent implements OnInit {
  cartService = inject(CartService);
  checkoutService = inject(CheckoutService);
  deliveryComplete = output<boolean>();

  onDeliveryMethodSelected(method: DeliveryMethod) {
    this.cartService.selectedDelivery.set(method);
    const cart = this.cartService.cart();
    if (cart) {
      cart.deliveryMethodId = method.id;
      this.cartService.setCart(cart);
      this.deliveryComplete.emit(true);
    }
  }

  ngOnInit(): void {
    this.checkoutService.getDeliveryMethods().subscribe({
      next: (methods) => {
        if (this.cartService.cart()?.deliveryMethodId) {
          const method = methods.find((m) => m.id === this.cartService.cart()?.deliveryMethodId);
          if (method) {
            this.cartService.selectedDelivery.set(method);
            this.deliveryComplete.emit(true);
          }
        }
      },
    });
  }
}
