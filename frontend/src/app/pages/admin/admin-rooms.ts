import { Component, inject } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { TableModule } from '@openng/optimus-ui/table';

import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-admin-rooms',
  imports: [ButtonModule, TableModule],
  template: `
    <div class="toolbar">
      <h2>Räume</h2>
      <p-button label="Neuer Raum" icon="pi pi-plus" [disabled]="true" />
    </div>
    <p-table [value]="data.rooms()" responsiveLayout="stack" breakpoint="768px">
      <ng-template #header>
        <tr><th scope="col">Name</th><th scope="col">Etage</th><th scope="col">Kapazität</th><th scope="col">Ausstattung</th></tr>
      </ng-template>
      <ng-template #body let-r>
        <tr><td>{{ r.name }}</td><td>{{ r.floor }}</td><td>{{ r.capacity }}</td><td>{{ r.equipment.join(', ') }}</td></tr>
      </ng-template>
    </p-table>
  `,
  styles: `.toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; }`,
})
export class AdminRooms {
  readonly data = inject(DataService);
}
