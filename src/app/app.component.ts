import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from './layout/header/header.component';
import { RouterModule } from '@angular/router';
import { AccountService } from './core/services/account.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, HeaderComponent],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'SkiNet';
}
