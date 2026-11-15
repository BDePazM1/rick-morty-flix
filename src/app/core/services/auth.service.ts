import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface UserSession {
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'rick-morty-flix-session';

  constructor(private readonly router: Router) {}

  getSession(): UserSession | null {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return null;

    try {
      const session = JSON.parse(stored) as UserSession;
      return typeof session.email === 'string' ? session : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  login(email: string): void {
    localStorage.setItem(this.storageKey, JSON.stringify({ email }));
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    void this.router.navigate(['/login']);
  }
}
