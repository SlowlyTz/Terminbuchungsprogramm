import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { TableModule } from '@openng/optimus-ui/table';

import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { Booking } from '../../core/models';
import { Notify } from '../../core/notify.service';
import { EmptyState } from '../../shared/empty-state/empty-state';

@Component({
  selector: 'app-my-bookings',
  imports: [DatePipe, ButtonModule, DialogModule, TableModule, EmptyState],
  templateUrl: './my-bookings.html',
})
export class MyBookings {
  private readonly auth = inject(AuthService);
  private readonly data = inject(DataService);
  private readonly notify = inject(Notify);
  private readonly router = inject(Router);

  readonly bookings = computed(() => this.data.bookingsForUser(this.auth.user().id));
  readonly roomName = (id: number) => this.data.roomById().get(id)?.name ?? '';

  readonly toCancel = signal<Booking | null>(null);

  book(): void {
    this.router.navigate(['/buchen']);
  }

  confirmCancel(): void {
    const b = this.toCancel();
    if (!b) return;
    this.data.cancel(b.id);
    this.notify.success(`„${b.title}“ in Raum ${this.roomName(b.roomId)} wurde storniert.`, 'Buchung storniert');
    this.toCancel.set(null);
  }
}
