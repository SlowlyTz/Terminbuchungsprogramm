import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { CardModule } from '@openng/optimus-ui/card';
import { TagModule } from '@openng/optimus-ui/tag';

import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-rooms',
  imports: [ButtonModule, CardModule, TagModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Räume</h1>
        <p>Alle buchbaren Besprechungsräume im Haus.</p>
      </header>
      <div class="grid">
        @for (r of rooms(); track r.id) {
          <p-card [header]="'Raum ' + r.name" [subheader]="r.floor + ' · bis ' + r.capacity + ' Personen'">
            <div class="tags">
              @for (e of r.equipment; track e) {
                <p-tag [value]="e" severity="secondary" />
              }
            </div>
            <p-button label="Diesen Raum buchen" icon="pi pi-calendar-plus" [outlined]="true" (onClick)="book(r.id)" />
          </p-card>
        }
      </div>
    </div>
  `,
  styles: `
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 1rem; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-bottom: 1rem; }
  `,
})
export class Rooms {
  private readonly data = inject(DataService);
  private readonly router = inject(Router);
  readonly rooms = this.data.rooms;

  book(roomId: number): void {
    this.router.navigate(['/buchen'], { queryParams: { raum: roomId } });
  }
}
