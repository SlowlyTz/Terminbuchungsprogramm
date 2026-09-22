import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { CardModule } from '@openng/optimus-ui/card';

import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink, ButtonModule, CardModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly auth = inject(AuthService);
  private readonly data = inject(DataService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly firstName = computed(() => this.auth.user().name.split(' ')[0]);
  readonly unread = this.notifications.unreadCount;
  /** Own bookings plus accepted invitations, next three by start time. */
  readonly upcoming = computed(() => {
    const now = Date.now();
    const own = this.data.upcomingForUser(this.auth.user().id, 10).map((b) => ({ id: 'b' + b.id, title: b.title, roomId: b.roomId, start: b.start, end: b.end, host: null as string | null }));
    const invited = this.notifications
      .accepted()
      .filter((i) => i.end.getTime() >= now)
      .map((i) => ({ id: 'i' + i.id, title: i.title, roomId: i.roomId, start: i.start, end: i.end, host: i.fromName }));
    return [...own, ...invited].sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, 4);
  });
  readonly lastBooking = computed(() => this.data.lastBookingOfUser(this.auth.user().id));
  readonly roomName = (id: number) => this.data.roomById().get(id)?.name ?? '';

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
