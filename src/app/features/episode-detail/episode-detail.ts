import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
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
    @if (loading) {
      <app-loader label="Cargando episodio y personajes..." />
    } @else if (error) {
      <section class="detail-page"><div class="error-state" role="alert">{{ error }}</div><a class="secondary-button" routerLink="/episodes">‹ Volver a episodios</a></section>
    } @else if (episode) {
      <section class="episode-detail-page">
        <div class="episode-detail-hero">
          <p class="eyebrow">DETALLE DEL EPISODIO</p>
          <span class="episode-code">{{ episode.episode }}</span>
          <h1>{{ episode.name }}</h1>
          <p class="muted">Fecha de emisión: {{ episode.air_date }}</p>
          <a class="secondary-button" routerLink="/episodes">‹ Volver al catálogo</a>
        </div>
        <section class="detail-episodes">
          <div class="section-heading">
            <div><p class="eyebrow">ELENCO INTERDIMENSIONAL</p><h2>Personajes del episodio</h2></div>
            <span class="muted">{{ characters.length }} personajes</span>
          </div>
          @if (characters.length) {
            <div class="character-grid">
              @for (character of characters; track character.id) {
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
  episode: Episode | null = null;
  characters: Character[] = [];
  loading = true;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: RickAndMortyService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      tap(() => {
        this.loading = true;
        this.error = '';
        this.episode = null;
        this.characters = [];
      }),
      map((params) => Number(params.get('id'))),
      switchMap((id) => {
        if (!Number.isInteger(id) || id < 1) throw new Error('ID de episodio no válido.');
        return this.api.getEpisode(id).pipe(
          switchMap((episode) => forkJoin({
            episode: of(episode),
            characters: this.api.getCharactersByIds(this.api.idsFromUrls(episode.characters))
          }))
        );
      }),
      catchError(() => of(null))
    ).subscribe((result) => {
      if (!result) {
        this.error = 'No se pudo encontrar este episodio.';
      } else {
        this.episode = result.episode;
        this.characters = result.characters;
      }
      this.loading = false;
    });
  }
}
