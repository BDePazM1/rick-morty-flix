import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="login-page">
      <a class="brand login-brand" routerLink="/">RICK<span>&</span>MORTY <b>FLIX</b></a>
      <section class="login-panel">
        <h1>Iniciar sesión</h1>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label for="email">Correo electrónico</label>
          <input id="email" type="email" formControlName="email" placeholder="tu@correo.com" autocomplete="email">
          @if (form.controls.email.touched && form.controls.email.invalid) {
            <small>Ingresa un correo electrónico válido.</small>
          }
          <label for="password">Contraseña</label>
          <input id="password" type="password" formControlName="password" placeholder="Contraseña" autocomplete="current-password">
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <small>La contraseña es obligatoria.</small>
          }
          <button class="primary-button login-submit" type="submit">Entrar</button>
        </form>
        <div class="login-divider"><span>o elige un perfil</span></div>
        <div class="profile-options">
          <button type="button" class="profile-option" (click)="quickLogin('rick@flix.com')">
            <span class="profile-avatar rick-avatar">R</span><span>Rick</span>
          </button>
          <button type="button" class="profile-option" (click)="quickLogin('morty@flix.com')">
            <span class="profile-avatar morty-avatar">M</span><span>Morty</span>
          </button>
          <button type="button" class="profile-option" (click)="quickLogin('summer@flix.com')">
            <span class="profile-avatar summer-avatar">S</span><span>Summer</span>
          </button>
        </div>
        <p class="login-note">Tu aventura por el multiverso empieza aquí.</p>
      </section>
    </main>
  `
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.quickLogin(this.form.getRawValue().email);
  }

  quickLogin(email: string): void {
    this.auth.login(email);
    void this.router.navigate(['/home']);
  }
}
