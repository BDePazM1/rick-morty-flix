import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="loader-wrap" role="status" aria-live="polite">
      <span class="spinner"></span>
      <span>{{ label }}</span>
    </div>
  `
})
export class LoaderComponent {
  @Input() label = 'Cargando contenido...';
}
