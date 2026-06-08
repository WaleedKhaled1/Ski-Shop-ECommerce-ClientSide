import { Component, inject, OnInit } from '@angular/core';
import { ShopService } from '../../core/services/shop.service';
import { Product } from '../../shared/models/product';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import { CartService } from '../../core/services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  imports: [
    CurrencyPipe,
    MatButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatDivider,
    FormsModule,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  private shopService = inject(ShopService);
  product?: Product;
  activatedRoute = inject(ActivatedRoute);
  cartService = inject(CartService);
  quantity = 1;
  quantityInCart = 0;

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) return;

    this.shopService.getProduct(+id).subscribe({
      next: (product) => {
        this.product = product;
        this.updateQuantity();
      },
      error: (error) => console.log(error),
    });
  }

  updateQuantity() {
    this.quantityInCart =
      this.cartService.cart()?.items.find((x) => x.productId === this.product?.id)?.quantity || 0;

    this.quantity = this.quantityInCart || 1;
  }

  getButtonText() {
    return this.quantityInCart > 0 ? 'updateCart' : 'addToCart';
  }

  updateCart() {
    if (!this.product) return;

    if (this.quantity > this.quantityInCart) {
      const itemsToAdd = this.quantity - this.quantityInCart;
      this.quantityInCart += itemsToAdd;
      this.cartService.addCartItem(this.product, itemsToAdd);
    } else {
      const itemsToRemove = this.quantityInCart - this.quantity;
      this.quantityInCart -= itemsToRemove;
      this.cartService.removeCartItem(this.product.id, itemsToRemove);
    }
  }

  validateQuantity() {
    if (!this.quantity || this.quantity < 1) {
      this.quantity = 1;
    }
  }
}
