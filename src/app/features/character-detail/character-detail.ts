import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, catchError, finalize, forkJoin, map, of, switchMap, throwError, tap } from 'rxjs';
import { Character } from '../../core/models/character';
import { Episode } from '../../core/models/episode';
import { RickAndMortyService } from '../../core/services/rick-and-morty.service';
import { LoaderComponent } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  template: `
    @if (loading()) {
      <app-loader label="Cargando personaje..." />
    } @else if (error()) {
      <section class="detail-page"><div class="error-state" role="alert">{{ error() }}</div><a class="secondary-button" routerLink="/characters">‹ Volver a personajes</a></section>
    } @else if (character(); as currentCharacter) {
      <section class="character-detail">
        <div class="detail-backdrop" [style.background-image]="'url(' + currentCharacter.image + ')'"></div>
        <div class="character-detail-main">
          <img class="detail-image" [src]="currentCharacter.image" [alt]="currentCharacter.name">
          <div class="detail-copy">
            <p class="eyebrow">PERSONAJE DEL MULTIVERSO</p>
            <h1>{{ currentCharacter.name }}</h1>
            <p class="detail-status"><span class="status-dot" [class]="statusClass"></span>{{ currentCharacter.status }} <span class="dot-separator">·</span> {{ currentCharacter.species }} <span class="dot-separator">·</span> {{ currentCharacter.gender }}</p>
            <div class="detail-facts">
              <div><span>Origen</span><strong>{{ currentCharacter.origin.name }}</strong></div>
              <div><span>Ubicación actual</span><strong>{{ currentCharacter.location.name }}</strong></div>
              @if (currentCharacter.type) { <div><span>Tipo</span><strong>{{ currentCharacter.type }}</strong></div> }
            </div>
            <a class="secondary-button" routerLink="/characters">‹ Volver al catálogo</a>
          </div>
        </div>
        <section class="detail-episodes">
          <div class="section-heading"><div><p class="eyebrow">SUS AVENTURAS</p><h2>Episodios en los que aparece</h2></div></div>
          @if (episodes().length) {
            <div class="episode-grid">
              @for (episode of episodes(); track episode.id) {
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
  readonly character = signal<Character | null>(null);
  readonly episodes = signal<Episode[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: RickAndMortyService
  ) {}

  get statusClass(): string {
    const status = this.character()?.status.toLowerCase();
    return status === 'alive' ? 'alive' : status === 'dead' ? 'dead' : 'unknown';
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      switchMap((id) => {
        this.loading.set(true);
        this.error.set('');
        this.character.set(null);
        this.episodes.set([]);
        const request = Number.isInteger(id) && id > 0
          ? this.api.getCharacter(id).pipe(
          switchMap((character) => forkJoin({
            character: of(character),
            episodes: this.api.getEpisodesByIds(this.api.idsFromUrls(character.episode))
          }))
          )
          : throwError(() => new Error('ID de personaje no válido.'));
        return request.pipe(
          tap((result) => {
            this.character.set(result.character);
            this.episodes.set(result.episodes);
          }),
          catchError((error: unknown) => {
            console.error('Error al cargar el detalle del personaje:', error);
            this.error.set('No se pudo cargar este personaje. Comprueba tu conexión e inténtalo de nuevo.');
            return EMPTY;
          }),
          finalize(() => this.loading.set(false))
        );
      }),
    ).subscribe();
  }
}
