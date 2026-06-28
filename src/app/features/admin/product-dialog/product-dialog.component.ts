import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FilterDialogComponent } from '../../shop/filter-dialog/filter-dialog.component';

@Component({
  selector: 'app-product-dialog',
  imports: [FormsModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './product-dialog.component.html',
  styleUrl: './product-dialog.component.css',
})
export class ProductDialogComponent implements OnInit {
  ngOnInit(): void {
    if (this.data) {
      this.productForm.patchValue(this.data);
    }
  }
  private fb = inject(FormBuilder);

  productForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: ['', [Validators.required, Validators.min(0.1)]],
    pictureUrl: [''],
    brand: ['', Validators.required],
    type: ['', Validators.required],
  });

  private dialogRef = inject(MatDialogRef<FilterDialogComponent>);
  public data = inject(MAT_DIALOG_DATA) || null;

  onSubmit() {
    if (this.productForm.valid) {
      this.dialogRef.close(this.productForm.value);
    }
  }
}
