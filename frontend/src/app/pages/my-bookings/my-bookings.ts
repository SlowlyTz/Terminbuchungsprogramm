import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { TableModule } from '@openng/optimus-ui/table';
import { TagModule } from '@openng/optimus-ui/tag';

import { AdminDataService } from '../../core/admin-data.service';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { Booking } from '../../core/models';
import { Notify } from '../../core/notify.service';
import { BookingDetail } from '../../shared/booking-detail/booking-detail';
import { BookingEdit } from '../../shared/booking-edit/booking-edit';
import { EmptyState } from '../../shared/empty-state/empty-state';

@Component({
  selector: 'app-my-bookings',
  imports: [DatePipe, ButtonModule, DialogModule, TableModule, TagModule, BookingDetail, BookingEdit, EmptyState],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.scss',
})
export class MyBookings {
  private readonly auth = inject(AuthService);
  private readonly data = inject(DataService);
  private readonly admin = inject(AdminDataService);
  private readonly notify = inject(Notify);
  private readonly router = inject(Router);

  readonly bookings = computed(() => this.data.bookingsForUser(this.auth.user().id));
  readonly roomName = (id: number) => this.data.roomById().get(id)?.name ?? '';
  readonly isPast = (b: Booking) => b.end.getTime() < Date.now();
  /** Everyone who gets a cancellation: people in the room and people joining online. */
  readonly invitedCount = (b: Booking) => b.invitees.length + b.onlineInvitees.length;

  readonly detail = signal<Booking | null>(null);
  readonly editing = signal<Booking | null>(null);
  readonly toCancel = signal<Booking | null>(null);

  book(): void {
    this.router.navigate(['/kalender']);
  }

  /** From the detail dialog into the edit dialog. */
  startEdit(b: Booking): void {
    this.detail.set(null);
    this.editing.set(b);
  }

  onSaved(b: Booking): void {
    this.editing.set(null);
    this.admin.log(this.auth.user().name, 'booking_changed', details(this.roomName(b.roomId), b));
    this.notify.success(`„${b.title}“ wurde auf ${time(b.start)}–${time(b.end)} Uhr geändert.`, 'Buchung geändert');
  }

  askCancel(b: Booking): void {
    this.detail.set(null);
    this.toCancel.set(b);
  }

  confirmCancel(): void {
    const b = this.toCancel();
    if (!b) return;
    this.data.cancel(b.id);
    this.admin.log(this.auth.user().name, 'booking_cancelled', details(this.roomName(b.roomId), b));
    this.notify.success(`„${b.title}“ in Raum ${this.roomName(b.roomId)} wurde storniert.`, 'Buchung storniert');
    this.toCancel.set(null);
  }
}

function time(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function details(roomName: string, b: Booking): string {
  const day = b.start.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
  return `Raum ${roomName}, ${day} ${time(b.start)}–${time(b.end)} Uhr`;
}
