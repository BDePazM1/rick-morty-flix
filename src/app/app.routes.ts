import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/login/login';
import { HomeComponent } from './features/home/home';
import { CharactersComponent } from './features/characters/characters';
import { EpisodesComponent } from './features/episodes/episodes';
import { CharacterDetailComponent } from './features/character-detail/character-detail';
import { EpisodeDetailComponent } from './features/episode-detail/episode-detail';
import { ProtectedLayoutComponent } from './shared/components/protected-layout/protected-layout';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ProtectedLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'characters', component: CharactersComponent },
      { path: 'episodes', component: EpisodesComponent },
      { path: 'character/:id', component: CharacterDetailComponent },
      { path: 'episode/:id', component: EpisodeDetailComponent },
      { path: '', pathMatch: 'full', redirectTo: 'home' }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
