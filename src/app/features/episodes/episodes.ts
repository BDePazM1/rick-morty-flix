import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Episode } from '../../core/models/episode';
import { RickAndMortyService } from '../../core/services/rick-and-morty.service';
import { LoaderComponent } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-episodes',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  template: `
    <section class="catalog-page">
      <div class="catalog-heading">
        <div><p class="eyebrow">TEMPORADAS Y AVENTURAS</p><h1>Episodios</h1><p class="muted">Cada portal abre una nueva historia.</p></div>
      </div>
      @if (loading) {
        <app-loader label="Cargando episodios..." />
      } @else if (error) {
        <div class="error-state" role="alert">{{ error }}</div>
      } @else {
        <div class="episode-grid">
          @for (episode of episodes; track episode.id) {
            <a class="episode-tile" [routerLink]="['/episode', episode.id]">
              <span class="episode-code">{{ episode.episode }}</span>
              <span class="episode-play">▶</span>
              <h2>{{ episode.name }}</h2>
              <p>{{ episode.air_date }}</p>
              <span class="tile-link">Ver episodio <b>›</b></span>
            </a>
          }
        </div>
        <div class="pagination">
          <button type="button" [disabled]="page <= 1" (click)="loadPage(page - 1)">‹ Anterior</button>
          <span>Página {{ page }} de {{ pages }}</span>
          <button type="button" [disabled]="page >= pages" (click)="loadPage(page + 1)">Siguiente ›</button>
        </div>
      }
    </section>
  `
})
export class EpisodesComponent implements OnInit {
  episodes: Episode[] = [];
  page = 1;
  pages = 1;
  loading = true;
  error = '';

  constructor(private readonly api: RickAndMortyService) {}

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading = true;
    this.error = '';
    this.api.getEpisodes(page).subscribe({
      next: (response) => {
        this.episodes = response.results;
        this.page = page;
        this.pages = response.info.pages;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los episodios. Comprueba tu conexión e inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }
}
