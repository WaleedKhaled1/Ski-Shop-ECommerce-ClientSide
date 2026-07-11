import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Address, User } from '../../shared/models/user';
import { map, tap } from 'rxjs';
import { CartService } from './cart.service';
import { SignalrService } from './signalr.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);
  currentUser = signal<User | null>(null);
  cartService = inject(CartService);
  signalrService = inject(SignalrService);

  login(values: any) {
    let params = new HttpParams();
    params = params.append('useCookies', true);
    return this.http.post<User>(this.baseUrl + 'login', values, { params }).pipe(
      tap((user) => {
        if (user) this.signalrService.createHubConnection();
      }),
    );
  }

  register(values: any) {
    return this.http.post(this.baseUrl + 'account/register', values);
  }

  logout() {
    if (this.cartService.cart()) {
      this.cartService.deleteCart();
    }

    return this.http.post(this.baseUrl + 'account/logout', {}).pipe(
      tap((user) => {
        if (user) this.signalrService.stopHubConnection();
      }),
    );
  }

  getUserInfo() {
    return this.http.get<User>(this.baseUrl + 'account/user-info').pipe(
      map((user) => {
        this.currentUser.set(user);
        return user;
      }),
    );
  }

  updateAddress(address: Address) {
    return this.http.post<Address>(this.baseUrl + 'account/address', address).pipe(
      tap(() => {
        this.currentUser.update((user) => {
          if (user) user.address = address;
          return user;
        });
      }),
    );
  }

  authState() {
    return this.http.get<{ isAuthenticated: boolean }>(this.baseUrl + 'account/auth-state');
  }
}
