import { Component, inject, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../../shared/models/order';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AddressPipe } from '../../../shared/pipes/address-pipe';
import { PaymentPipe } from '../../../shared/pipes/payment-pipe';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-order-detailed',
  imports: [MatCardModule, DatePipe, AddressPipe, CurrencyPipe, PaymentPipe, MatButton, RouterLink],
  templateUrl: './order-detailed.component.html',
  styleUrl: './order-detailed.component.css',
})
export class OrderDetailedComponent implements OnInit {
  private orderService = inject(OrderService);
  activatedRoute = inject(ActivatedRoute);
  order?: Order;

  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if (!id) return;

    this.orderService.getOrderForUser(+id).subscribe({
      next: (order) => (this.order = order),
    });
  }
}
