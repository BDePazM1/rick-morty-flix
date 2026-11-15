import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <a class="brand" routerLink="/home" aria-label="Rick and Morty Flix, inicio">
        RICK<span>&</span>MORTY <b>FLIX</b>
      </a>
      <nav aria-label="Navegación principal">
        <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
        <a routerLink="/episodes" routerLinkActive="active">Episodios</a>
        <a routerLink="/characters" routerLinkActive="active">Personajes</a>
      </nav>
      <button class="logout-button" type="button" (click)="auth.logout()">Cerrar sesión</button>
    </header>
  `
})
export class NavbarComponent {
  constructor(public readonly auth: AuthService) {}
}
