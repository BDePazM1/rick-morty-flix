import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, catchError, finalize, forkJoin, map, of, switchMap, throwError, tap } from 'rxjs';
import { Character } from '../../core/models/character';
import { Episode } from '../../core/models/episode';
import { RickAndMortyService } from '../../core/services/rick-and-morty.service';
import { CharacterCardComponent } from '../../shared/components/character-card/character-card';
import { LoaderComponent } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-episode-detail',
  standalone: true,
  imports: [RouterLink, CharacterCardComponent, LoaderComponent],
  template: `
    @if (loading()) {
      <app-loader label="Cargando episodio y personajes..." />
    } @else if (error()) {
      <section class="detail-page"><div class="error-state" role="alert">{{ error() }}</div><a class="secondary-button" routerLink="/episodes">‹ Volver a episodios</a></section>
    } @else if (episode(); as currentEpisode) {
      <section class="episode-detail-page">
        <div class="episode-detail-hero">
          <p class="eyebrow">DETALLE DEL EPISODIO</p>
          <span class="episode-code">{{ currentEpisode.episode }}</span>
          <h1>{{ currentEpisode.name }}</h1>
          <p class="muted">Fecha de emisión: {{ currentEpisode.air_date }}</p>
          <a class="secondary-button" routerLink="/episodes">‹ Volver al catálogo</a>
        </div>
        <section class="detail-episodes">
          <div class="section-heading">
            <div><p class="eyebrow">ELENCO INTERDIMENSIONAL</p><h2>Personajes del episodio</h2></div>
            <span class="muted">{{ characters().length }} personajes</span>
          </div>
          @if (characters().length) {
            <div class="character-grid">
              @for (character of characters(); track character.id) {
                <app-character-card [character]="character" />
              }
            </div>
          } @else {
            <p class="muted">No hay personajes disponibles para este episodio.</p>
          }
        </section>
      </section>
    }
  `
})
export class EpisodeDetailComponent implements OnInit {
  readonly episode = signal<Episode | null>(null);
  readonly characters = signal<Character[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: RickAndMortyService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      switchMap((id) => {
        this.loading.set(true);
        this.error.set('');
        this.episode.set(null);
        this.characters.set([]);
        const request = Number.isInteger(id) && id > 0
          ? this.api.getEpisode(id).pipe(
          switchMap((episode) => forkJoin({
            episode: of(episode),
            characters: this.api.getCharactersByIds(this.api.idsFromUrls(episode.characters))
          }))
          )
          : throwError(() => new Error('ID de episodio no válido.'));
        return request.pipe(
          tap((result) => {
            this.episode.set(result.episode);
            this.characters.set(result.characters);
          }),
          catchError((error: unknown) => {
            console.error('Error al cargar el detalle del episodio:', error);
            this.error.set('No se pudo cargar este episodio. Comprueba tu conexión e inténtalo de nuevo.');
            return EMPTY;
          }),
          finalize(() => this.loading.set(false))
        );
      }),
    ).subscribe();
  }
}
