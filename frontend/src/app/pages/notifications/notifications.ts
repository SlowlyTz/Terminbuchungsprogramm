import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { TagModule } from '@openng/optimus-ui/tag';

import { DataService } from '../../core/data.service';
import { Invitation } from '../../core/models';
import { NotificationService } from '../../core/notification.service';
import { Notify } from '../../core/notify.service';
import { EmptyState } from '../../shared/empty-state/empty-state';

@Component({
  selector: 'app-notifications',
  imports: [DatePipe, ButtonModule, TagModule, EmptyState],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
  private readonly data = inject(DataService);
  private readonly notify = inject(Notify);
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
    this.notify.success(`„${i.title}“ steht jetzt in Ihren Terminen.`, 'Zugesagt');
  }

  decline(i: Invitation): void {
    this.notifications.respond(i.id, 'declined');
    this.notify.info(`${i.fromName} wird benachrichtigt.`, 'Abgesagt');
  }
}
