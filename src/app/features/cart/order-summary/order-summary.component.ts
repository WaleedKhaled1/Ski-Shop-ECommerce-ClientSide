import { Component, inject } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { CurrencyPipe } from '@angular/common';
import { MatAnchor, MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatLabel, MatFormField } from '@angular/material/select';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-order-summary',
  imports: [CurrencyPipe, MatAnchor, MatButton, RouterLink, MatLabel, MatFormField, MatInput],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css',
})
export class OrderSummaryComponent {
  cartService = inject(CartService);
}
