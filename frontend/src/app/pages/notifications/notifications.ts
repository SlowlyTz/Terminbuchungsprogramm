import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { TagModule } from '@openng/optimus-ui/tag';

import { DataService } from '../../core/data.service';
import { Invitation } from '../../core/models';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [DatePipe, ButtonModule, TagModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
  private readonly data = inject(DataService);
  readonly notifications = inject(NotificationService);

  readonly open = this.notifications.open;
  readonly answered = computed(() =>
    this.notifications
      .invitations()
      .filter((i) => i.status !== 'open')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  );

  readonly roomName = (id: number) => this.data.roomById().get(id)?.name ?? '';

  accept(i: Invitation): void {
    this.notifications.respond(i.id, 'accepted');
  }

  decline(i: Invitation): void {
    this.notifications.respond(i.id, 'declined');
  }
}
