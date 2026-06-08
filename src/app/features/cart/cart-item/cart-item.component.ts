import { Component, inject, input } from '@angular/core';
import { CartItem } from '../../../shared/models/cart';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatAnchor, MatIconButton } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { CdkAutofill } from '@angular/cdk/text-field';

@Component({
  selector: 'app-cart-item',
  imports: [RouterLink, MatIcon, CurrencyPipe, MatIconButton, MatAnchor],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.css',
})
export class CartItemComponent {
  item = input.required<CartItem>();
  cartService = inject(CartService);
}
