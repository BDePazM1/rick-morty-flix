import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { Character } from '../models/character';
import { Episode } from '../models/episode';

@Injectable({ providedIn: 'root' })
export class RickAndMortyService {
  private readonly apiUrl = 'https://rickandmortyapi.com/api';

  constructor(private readonly http: HttpClient) {}

  getCharacters(page = 1, name = ''): Observable<ApiResponse<Character>> {
    let params = new HttpParams().set('page', page);
    if (name.trim()) params = params.set('name', name.trim());
    return this.http.get<ApiResponse<Character>>(`${this.apiUrl}/character`, { params });
  }

  getCharacter(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.apiUrl}/character/${id}`);
  }

  getCharactersByIds(ids: number[]): Observable<Character[]> {
    if (!ids.length) return of([]);
    return this.http.get<Character | Character[]>(
      `${this.apiUrl}/character/${ids.join(',')}`
    ).pipe(map((response) => Array.isArray(response) ? response : [response]));
  }

  getEpisodes(page = 1): Observable<ApiResponse<Episode>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<ApiResponse<Episode>>(`${this.apiUrl}/episode`, { params });
  }

  getEpisode(id: number): Observable<Episode> {
    return this.http.get<Episode>(`${this.apiUrl}/episode/${id}`);
  }

  getEpisodesByIds(ids: number[]): Observable<Episode[]> {
    if (!ids.length) return of([]);
    return this.http.get<Episode | Episode[]>(
      `${this.apiUrl}/episode/${ids.join(',')}`
    ).pipe(map((response) => Array.isArray(response) ? response : [response]));
  }

  idsFromUrls(urls: string[]): number[] {
    return urls
      .map((url) => Number(url.match(/\/(\d+)\/?$/)?.[1]))
      .filter((id) => Number.isInteger(id) && id > 0);
  }
}
