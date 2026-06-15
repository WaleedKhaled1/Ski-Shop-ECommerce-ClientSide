import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-server-error',
  imports: [RouterLink],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.css',
})
export class ServerErrorComponent {
  error?: any;
  constructor(route: Router) {
    const navigation = route.currentNavigation();
    this.error = navigation?.extras.state?.['error'];
  }
}
