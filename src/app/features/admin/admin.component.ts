import { Component, inject, OnInit, signal } from '@angular/core';
import { Product } from '../../shared/models/product';
import { AdminService } from '../../core/services/admin.service';
import { ShopService } from '../../core/services/shop.service';
import { ShopParams } from '../../shared/models/shopparams';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Pagination } from '../../shared/models/pagination';
@Component({
  selector: 'app-admin',
  imports: [MatIcon, MatPaginator, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  ngOnInit(): void {
    this.loadProducts();
  }
  shopParams = new ShopParams();
  products?: Pagination<Product>;
  adminService = inject(AdminService);
  shopService = inject(ShopService);
  private dialogService = inject(MatDialog);
  pageSizeOptions = [5, 10, 15, 20, 25];

  loadProducts() {
    this.shopService.getProducts(this.shopParams).subscribe({
      next: (response) => {
        this.products = response;
      },
      error: (err) => console.error(err),
    });
  }

  handlePagination(event: PageEvent) {
    this.shopParams.pageNumber = event.pageIndex + 1;
    this.shopParams.pageSize = event.pageSize;

    this.loadProducts();
  }

  onDeleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.adminService.deleteProduct(id).subscribe({
        next: () => {
          if (this.products && this.products.data) {
            this.products.data = this.products.data.filter((p) => p.id !== id);

            this.products.totalCount--;
            this.loadProducts();
          }
        },
      });
    }
  }

  openCreateModal() {
    const dialogRef = this.dialogService.open(ProductDialogComponent, {
      minWidth: '500px',
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        this.shopService.createProduct(result).subscribe({
          next: () => {
            this.loadProducts();
          },
        });
      },
    });
  }
  editProduct(product: Product) {
    const dialogRef = this.dialogService.open(ProductDialogComponent, {
      width: '500px',
      data: product,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedProduct = { ...result, id: product.id };

        this.shopService.updateProduct(product.id, updatedProduct).subscribe({
          next: () => {
            this.loadProducts();
          },
          error: (err) => console.error('Error updating product:', err),
        });
      }
    });
  }
}
