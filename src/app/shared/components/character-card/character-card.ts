import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Character } from '../../../core/models/character';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="character-card" [routerLink]="['/character', character.id]">
      <img [src]="character.image" [alt]="character.name" loading="lazy">
      <div class="card-copy">
        <h3>{{ character.name }}</h3>
        <p><span class="status-dot" [class]="statusClass"></span>{{ character.status }} · {{ character.species }}</p>
      </div>
    </a>
  `
})
export class CharacterCardComponent {
  @Input({ required: true }) character!: Character;

  get statusClass(): string {
    const status = this.character.status.toLowerCase();
    return status === 'alive' ? 'alive' : status === 'dead' ? 'dead' : 'unknown';
  }
}
