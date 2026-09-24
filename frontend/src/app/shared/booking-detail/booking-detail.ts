import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { TagModule } from '@openng/optimus-ui/tag';

import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { Booking, InvitationStatus } from '../../core/models';

const STATUS_META: Record<InvitationStatus, { label: string; icon: string; severity: 'success' | 'secondary' | 'warn' }> = {
  accepted: { label: 'zugesagt', icon: 'pi pi-check', severity: 'success' },
  declined: { label: 'abgesagt', icon: 'pi pi-times', severity: 'secondary' },
  open: { label: 'offen', icon: 'pi pi-clock', severity: 'warn' },
};

/** Read-only view of a booking; used by the calendar, my bookings and the dashboard. */
@Component({
  selector: 'app-booking-detail',
  imports: [DatePipe, NgTemplateOutlet, ButtonModule, DialogModule, TagModule],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.scss',
})
export class BookingDetail {
  private readonly data = inject(DataService);
  private readonly auth = inject(AuthService);

  readonly booking = input<Booking | null>(null);
  /** Shows the edit and cancel buttons; only meaningful for the user's own bookings. */
  readonly showActions = input(false);

  readonly close = output<void>();
  readonly edit = output<Booking>();
  readonly cancel = output<Booking>();

  readonly open = computed(() => this.booking() !== null);
  readonly room = computed(() => {
    const b = this.booking();
    return b ? (this.data.roomById().get(b.roomId) ?? null) : null;
  });
  readonly isOwn = computed(() => this.booking()?.userId === this.auth.user().id);
  readonly canAct = computed(() => this.showActions() && this.isOwn());
  readonly isPast = computed(() => {
    const b = this.booking();
    return b ? b.end.getTime() < Date.now() : false;
  });

  readonly statusLabel = (s: InvitationStatus | undefined) => STATUS_META[s ?? 'open'].label;
  readonly statusIcon = (s: InvitationStatus | undefined) => STATUS_META[s ?? 'open'].icon;
  readonly statusSeverity = (s: InvitationStatus | undefined) => STATUS_META[s ?? 'open'].severity;

  onVisibleChange(visible: boolean): void {
    if (!visible) this.close.emit();
  }
}
