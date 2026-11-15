import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
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
      @if (loading()) {
        <app-loader label="Cargando episodios..." />
      } @else if (error()) {
        <div class="error-state" role="alert">{{ error() }}</div>
      } @else {
        <div class="episode-grid">
          @for (episode of episodes(); track episode.id) {
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
          <button type="button" [disabled]="page() <= 1" (click)="loadPage(page() - 1)">‹ Anterior</button>
          <span>Página {{ page() }} de {{ pages() }}</span>
          <button type="button" [disabled]="page() >= pages()" (click)="loadPage(page() + 1)">Siguiente ›</button>
        </div>
      }
    </section>
  `
})
export class EpisodesComponent implements OnInit {
  readonly episodes = signal<Episode[]>([]);
  readonly page = signal(1);
  readonly pages = signal(1);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor(private readonly api: RickAndMortyService) {}

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getEpisodes(page).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (response) => {
        this.episodes.set(response.results);
        this.page.set(page);
        this.pages.set(response.info.pages);
      },
      error: (error: unknown) => {
        console.error('Error al cargar episodios:', error);
        this.episodes.set([]);
        this.page.set(1);
        this.pages.set(1);
        this.error.set('No se pudieron cargar los episodios. Comprueba tu conexión e inténtalo de nuevo.');
      }
    });
  }
}
