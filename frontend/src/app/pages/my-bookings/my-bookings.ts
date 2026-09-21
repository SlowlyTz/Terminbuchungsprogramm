import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { MessageModule } from '@openng/optimus-ui/message';
import { TableModule } from '@openng/optimus-ui/table';

import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { Booking } from '../../core/models';

@Component({
  selector: 'app-my-bookings',
  imports: [DatePipe, ButtonModule, DialogModule, MessageModule, TableModule],
  templateUrl: './my-bookings.html',
})
export class MyBookings {
  private readonly auth = inject(AuthService);
  private readonly data = inject(DataService);

  readonly bookings = computed(() => this.data.bookingsForUser(this.auth.user().id));
  readonly roomName = (id: number) => this.data.roomById().get(id)?.name ?? '';

  readonly toCancel = signal<Booking | null>(null);
  readonly notice = signal<string | null>(null);

  confirmCancel(): void {
    const b = this.toCancel();
    if (!b) return;
    this.data.cancel(b.id);
    this.notice.set(`Die Buchung „${b.title}“ in Raum ${this.roomName(b.roomId)} wurde storniert.`);
    this.toCancel.set(null);
  }
}
