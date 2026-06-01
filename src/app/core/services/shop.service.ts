import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Pagination } from '../../shared/models/pagination';
import { Product } from '../../shared/models/product';
import { ShopParams } from '../../shared/models/shopparams';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  baseUrl = 'https://localhost:5001/api/';
  private http = inject(HttpClient);

  brands: string[] = [];
  types: string[] = [];

  getProducts(shopsParams: ShopParams) {
    let params = new HttpParams();

    if (shopsParams.brands.length > 0)
      params = params.append('brands', shopsParams.brands.join(','));

    if (shopsParams.types.length > 0) params = params.append('types', shopsParams.types.join(','));

    if (shopsParams.sort) params = params.append('sort', shopsParams.sort);

    params = params.append('pageSize', shopsParams.pageSize);
    params = params.append('pageNumber', shopsParams.pageNumber);

    if (shopsParams.search) params = params.append('search', shopsParams.search);
    return this.http.get<Pagination<Product>>(this.baseUrl + 'products', { params });
  }

  getBrands() {
    if (this.brands.length > 0) return;

    this.http.get<string[]>(this.baseUrl + 'products/brands').subscribe({
      next: (response) => (this.brands = response),
    });
  }

  getTypes() {
    if (this.types.length > 0) return;
    this.http.get<string[]>(this.baseUrl + 'products/types').subscribe({
      next: (response) => (this.types = response),
    });
  }

  getProduct(id: number) {
    return this.http.get<Product>(this.baseUrl + 'products/' + id);
  }
}
