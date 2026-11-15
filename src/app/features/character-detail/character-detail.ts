import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { Character } from '../../core/models/character';
import { Episode } from '../../core/models/episode';
import { RickAndMortyService } from '../../core/services/rick-and-morty.service';
import { LoaderComponent } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  template: `
    @if (loading) {
      <app-loader label="Cargando personaje..." />
    } @else if (error) {
      <section class="detail-page"><div class="error-state" role="alert">{{ error }}</div><a class="secondary-button" routerLink="/characters">‹ Volver a personajes</a></section>
    } @else if (character) {
      <section class="character-detail">
        <div class="detail-backdrop" [style.background-image]="'url(' + character.image + ')'"></div>
        <div class="character-detail-main">
          <img class="detail-image" [src]="character.image" [alt]="character.name">
          <div class="detail-copy">
            <p class="eyebrow">PERSONAJE DEL MULTIVERSO</p>
            <h1>{{ character.name }}</h1>
            <p class="detail-status"><span class="status-dot" [class]="statusClass"></span>{{ character.status }} <span class="dot-separator">·</span> {{ character.species }} <span class="dot-separator">·</span> {{ character.gender }}</p>
            <div class="detail-facts">
              <div><span>Origen</span><strong>{{ character.origin.name }}</strong></div>
              <div><span>Ubicación actual</span><strong>{{ character.location.name }}</strong></div>
              @if (character.type) { <div><span>Tipo</span><strong>{{ character.type }}</strong></div> }
            </div>
            <a class="secondary-button" routerLink="/characters">‹ Volver al catálogo</a>
          </div>
        </div>
        <section class="detail-episodes">
          <div class="section-heading"><div><p class="eyebrow">SUS AVENTURAS</p><h2>Episodios en los que aparece</h2></div></div>
          @if (episodes.length) {
            <div class="episode-grid">
              @for (episode of episodes; track episode.id) {
                <a class="episode-tile compact-tile" [routerLink]="['/episode', episode.id]">
                  <span class="episode-code">{{ episode.episode }}</span>
                  <h2>{{ episode.name }}</h2><p>{{ episode.air_date }}</p>
                </a>
              }
            </div>
          } @else {
            <p class="muted">No hay episodios disponibles para mostrar.</p>
          }
        </section>
      </section>
    }
  `
})
export class CharacterDetailComponent implements OnInit {
  character: Character | null = null;
  episodes: Episode[] = [];
  loading = true;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: RickAndMortyService
  ) {}

  get statusClass(): string {
    const status = this.character?.status.toLowerCase();
    return status === 'alive' ? 'alive' : status === 'dead' ? 'dead' : 'unknown';
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      tap(() => {
        this.loading = true;
        this.error = '';
        this.character = null;
        this.episodes = [];
      }),
      map((params) => Number(params.get('id'))),
      switchMap((id) => {
        if (!Number.isInteger(id) || id < 1) throw new Error('ID de personaje no válido.');
        return this.api.getCharacter(id).pipe(
          switchMap((character) => forkJoin({
            character: of(character),
            episodes: this.api.getEpisodesByIds(this.api.idsFromUrls(character.episode))
          }))
        );
      }),
      catchError(() => of(null))
    ).subscribe((result) => {
      if (!result) {
        this.error = 'No se pudo encontrar este personaje.';
      } else {
        this.character = result.character;
        this.episodes = result.episodes;
      }
      this.loading = false;
    });
  }
}
