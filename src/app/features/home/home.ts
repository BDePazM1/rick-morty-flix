import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Character } from '../../core/models/character';
import { Episode } from '../../core/models/episode';
import { RickAndMortyService } from '../../core/services/rick-and-morty.service';
import { CharacterCardComponent } from '../../shared/components/character-card/character-card';
import { LoaderComponent } from '../../shared/components/loader/loader';

interface EpisodeRow {
  episode: Episode;
  characters: Character[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CharacterCardComponent, LoaderComponent],
  template: `
    <section class="hero-banner">
      <div class="hero-shade"></div>
      <div class="hero-content">
        <p class="eyebrow">RICK & MORTY ORIGINAL</p>
        <h1>Un universo.<br><span>Infinitas posibilidades.</span></h1>
        <p class="hero-description">Acompaña a Rick y Morty en aventuras interdimensionales que desafían toda lógica.</p>
        <a class="primary-button" routerLink="/character/1">▶&nbsp; Ver detalles</a>
      </div>
      <div class="hero-caption">TEMPORADA 1 · 2013</div>
    </section>

    <section class="home-catalog">
      <div class="section-heading">
        <div><p class="eyebrow">EXPLORA EL MULTIVERSO</p><h2>Episodios destacados</h2></div>
        <a class="text-link" routerLink="/episodes">Ver todos <span>›</span></a>
      </div>
      @if (loading) {
        <app-loader label="Cargando episodios y personajes..." />
      } @else if (error) {
        <div class="error-state" role="alert">{{ error }}</div>
      } @else {
        @for (row of rows; track row.episode.id) {
          <section class="episode-row">
            <div class="episode-row-heading">
              <a [routerLink]="['/episode', row.episode.id]"><span>{{ row.episode.episode }}</span> {{ row.episode.name }} <b>›</b></a>
              <span class="row-date">{{ row.episode.air_date }}</span>
            </div>
            <div class="character-carousel">
              @for (character of row.characters; track character.id) {
                <app-character-card [character]="character" />
              }
            </div>
          </section>
        }
      }
    </section>
  `
})
export class HomeComponent implements OnInit {
  rows: EpisodeRow[] = [];
  loading = true;
  error = '';

  constructor(private readonly api: RickAndMortyService) {}

  ngOnInit(): void {
    this.api.getEpisodes(1).subscribe({
      next: (response) => {
        const episodes = response.results;
        forkJoin(episodes.map((episode) =>
          this.api.getCharactersByIds(this.api.idsFromUrls(episode.characters))
        )).subscribe({
          next: (charactersByEpisode) => {
            this.rows = episodes.map((episode, index) => ({
              episode,
              characters: charactersByEpisode[index] ?? []
            }));
            this.loading = false;
          },
          error: () => {
            this.error = 'No se pudieron cargar los personajes de los episodios. Inténtalo de nuevo más tarde.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'No se pudieron cargar los episodios. Comprueba tu conexión e inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }
}
