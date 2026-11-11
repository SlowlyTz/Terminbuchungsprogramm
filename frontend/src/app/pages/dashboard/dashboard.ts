import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { CardModule } from '@openng/optimus-ui/card';
import { TagModule } from '@openng/optimus-ui/tag';

import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { Booking } from '../../core/models';
import { NotificationService } from '../../core/notification.service';
import { BookingDetail } from '../../shared/booking-detail/booking-detail';

interface UpcomingEntry {
  id: string;
  title: string;
  roomId: number;
  start: Date;
  end: Date;
  host: string | null;
  booking: Booking | null;
}

/** Appointments starting within this window get an "in N Min." badge. */
const SOON_MINUTES = 60;

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, NgTemplateOutlet, RouterLink, ButtonModule, CardModule, TagModule, BookingDetail],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly auth = inject(AuthService);
  private readonly data = inject(DataService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly detail = signal<Booking | null>(null);
  /** Refreshed every minute so the badges stay current while the page is open. */
  readonly now = signal(Date.now());

  readonly firstName = computed(() => this.auth.user().name.split(' ')[0]);
  readonly unread = this.notifications.unreadCount;
  /** Own bookings plus accepted invitations, next three by start time. */
  readonly upcoming = computed<UpcomingEntry[]>(() => {
    const now = this.now();
    const own = this.data
      .upcomingForUser(this.auth.user().id, 10)
      .map((b) => ({ id: 'b' + b.id, title: b.title, roomId: b.roomId, start: b.start, end: b.end, host: null as string | null, booking: b as Booking | null }));
    const invited = this.notifications
      .accepted()
      .filter((i) => i.end.getTime() >= now)
      .map((i) => ({ id: 'i' + i.id, title: i.title, roomId: i.roomId, start: i.start, end: i.end, host: i.fromName, booking: null as Booking | null }));
    return [...own, ...invited].sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, 4);
  });
  readonly lastBooking = computed(() => this.data.lastBookingOfUser(this.auth.user().id));
  readonly roomName = (id: number) => this.data.roomById().get(id)?.name ?? '';

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  status(entry: UpcomingEntry): { label: string; severity: 'success' | 'info' } | null {
    const now = this.now();
    const start = entry.start.getTime();
    if (start <= now && now < entry.end.getTime()) return { label: 'läuft gerade', severity: 'success' };
    const minutes = Math.ceil((start - now) / 60_000);
    if (minutes > 0 && minutes <= SOON_MINUTES) return { label: `in ${minutes} Min.`, severity: 'info' };
    return null;
  }

  book(): void {
    this.router.navigate(['/kalender']);
  }

  repeatLast(): void {
    const last = this.lastBooking();
    if (last) {
      this.router.navigate(['/kalender'], { queryParams: { raum: last.roomId, vorlage: last.id } });
    }
  }
}
