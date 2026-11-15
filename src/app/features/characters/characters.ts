import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Character } from '../../core/models/character';
import { RickAndMortyService } from '../../core/services/rick-and-morty.service';
import { CharacterCardComponent } from '../../shared/components/character-card/character-card';
import { LoaderComponent } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [ReactiveFormsModule, CharacterCardComponent, LoaderComponent],
  template: `
    <section class="catalog-page">
      <div class="catalog-heading">
        <div><p class="eyebrow">TODOS LOS UNIVERSOS</p><h1>Personajes</h1><p class="muted">Descubre a los habitantes más extraordinarios del multiverso.</p></div>
        <form class="search-form" [formGroup]="searchForm" (ngSubmit)="search()">
          <input type="search" formControlName="name" placeholder="Buscar personaje..." aria-label="Buscar personaje">
          <button type="submit" aria-label="Buscar">⌕</button>
        </form>
      </div>
      @if (loading) {
        <app-loader label="Cargando personajes..." />
      } @else if (error) {
        <div class="error-state" role="alert">{{ error }}</div>
      } @else if (!characters.length) {
        <div class="empty-state">No encontramos personajes con ese nombre. Prueba otra búsqueda.</div>
      } @else {
        <div class="character-grid">
          @for (character of characters; track character.id) {
            <app-character-card [character]="character" />
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
export class CharactersComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  readonly searchForm = this.formBuilder.nonNullable.group({ name: [''] });
  characters: Character[] = [];
  page = 1;
  pages = 1;
  loading = true;
  error = '';

  constructor(
    private readonly api: RickAndMortyService
  ) {}

  ngOnInit(): void {
    this.loadPage(1);
  }

  search(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading = true;
    this.error = '';
    this.api.getCharacters(page, this.searchForm.controls.name.value).subscribe({
      next: (response) => {
        this.characters = response.results;
        this.page = page;
        this.pages = response.info.pages;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.characters = [];
        this.pages = 1;
        this.page = 1;
        this.loading = false;
        this.error = error instanceof HttpErrorResponse && error.status === 404
          ? ''
          : 'No se pudieron cargar los personajes. Comprueba tu conexión e inténtalo de nuevo.';
      }
    });
  }
}
