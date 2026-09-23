import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from '@openng/optimus-ui/autocomplete';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';

import { AdminDataService } from '../../core/admin-data.service';
import { AuthService } from '../../core/auth.service';
import { DataService, combine } from '../../core/data.service';
import { Booking, Invitee } from '../../core/models';
import { Notify } from '../../core/notify.service';
import { inviteLimit, seatLimitWarning } from '../../core/seats';
import { Collapsible } from '../collapsible/collapsible';

interface EditDraft {
  startTime: string;
  endTime: string;
  title: string;
  invitees: Invitee[];
  online: boolean;
}

/** Edit dialog for an existing booking: time, title and invitees. */
@Component({
  selector: 'app-booking-edit',
  imports: [DatePipe, FormsModule, AutoCompleteModule, ButtonModule, DialogModule, InputTextModule, MessageModule, ToggleSwitchModule, Collapsible],
  templateUrl: './booking-edit.html',
  styleUrl: './booking-edit.scss',
})
export class BookingEdit {
  private readonly data = inject(DataService);
  private readonly admin = inject(AdminDataService);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(Notify);

  readonly booking = input<Booking | null>(null);

  readonly close = output<void>();
  readonly saved = output<Booking>();

  readonly draft = signal<EditDraft | null>(null);
  readonly suggestions = signal<Invitee[]>([]);
  readonly conflict = signal<Booking | null>(null);

  readonly open = computed(() => this.booking() !== null);
  readonly roomName = computed(() => {
    const b = this.booking();
    return b ? (this.data.roomById().get(b.roomId)?.name ?? '') : '';
  });

  // --- Seats (same rules as when booking) --------------------------------------
  readonly moreOpen = signal(false);
  readonly seatCapacity = computed(() => {
    const b = this.booking();
    return b ? (this.data.roomById().get(b.roomId)?.capacity ?? 0) : 0;
  });
  readonly seatsTaken = computed(() => (this.draft()?.invitees.length ?? 0) + 1);
  readonly roomFull = computed(() => !this.draft()?.online && this.seatsTaken() >= this.seatCapacity());
  readonly onlineLocked = computed(() => {
    const d = this.draft();
    return !!d && d.online && d.invitees.length > inviteLimit(this.seatCapacity(), false);
  });

  readonly start = computed(() => {
    const b = this.booking();
    const d = this.draft();
    return b && d ? combine(b.start, d.startTime) : null;
  });
  readonly end = computed(() => {
    const b = this.booking();
    const d = this.draft();
    return b && d ? combine(b.start, d.endTime) : null;
  });

  readonly invalid = computed(() => {
    const s = this.start();
    const e = this.end();
    return !s || !e || e <= s;
  });

  readonly unchanged = computed(() => {
    const b = this.booking();
    const d = this.draft();
    if (!b || !d) return true;
    return (
      d.title === b.title &&
      d.online === b.online &&
      d.startTime === toTime(b.start) &&
      d.endTime === toTime(b.end) &&
      d.invitees.length === b.invitees.length &&
      d.invitees.every((i) => b.invitees.some((o) => o.id === i.id))
    );
  });

  constructor() {
    // Refill the form whenever another booking is handed in.
    effect(() => {
      const b = this.booking();
      this.conflict.set(null);
      this.moreOpen.set(!!b?.online);
      this.draft.set(
        b ? { startTime: toTime(b.start), endTime: toTime(b.end), title: b.title, invitees: [...b.invitees], online: b.online } : null,
      );
    });
  }

  patch(patch: Partial<EditDraft>): void {
    this.draft.update((d) => (d ? { ...d, ...patch } : d));
    this.conflict.set(null);
  }

  /** Accepts the new invitee list up to the room's seats; anything beyond is dropped with a warning. */
  setInvitees(list: Invitee[]): void {
    const d = this.draft();
    if (!d) return;
    const max = inviteLimit(this.seatCapacity(), d.online);
    if (list.length > max) {
      const { summary, detail } = seatLimitWarning(this.seatCapacity());
      this.notify.warn(detail, summary);
      this.moreOpen.set(true);
      this.patch({ invitees: list.slice(0, max) });
      return;
    }
    this.patch({ invitees: list });
  }

  setOnline(online: boolean): void {
    if (!online && this.onlineLocked()) return;
    this.patch({ online });
  }

  searchInvitees(event: AutoCompleteCompleteEvent): void {
    const q = event.query.trim().toLowerCase();
    const chosen = new Set(this.draft()?.invitees.map((i) => i.id) ?? []);
    this.suggestions.set(
      this.admin
        .users()
        .filter((u) => u.active && u.id !== this.auth.user().id && !chosen.has(u.id))
        .map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, department: u.department }))
        .filter((i) => !q || `${i.name} ${i.department}`.toLowerCase().includes(q))
        .slice(0, 8),
    );
  }

  save(): void {
    const b = this.booking();
    const d = this.draft();
    const s = this.start();
    const e = this.end();
    if (!b || !d || !s || !e || this.invalid()) return;

    // The booking must not collide with itself, hence the id.
    const clash = this.data.findConflict(b.roomId, s, e, b.id);
    if (clash) {
      this.conflict.set(clash);
      return;
    }

    const updated = this.data.update(b.id, { start: s, end: e, title: d.title, invitees: d.invitees, online: d.online });
    if (updated) this.saved.emit(updated);
  }

  onVisibleChange(visible: boolean): void {
    if (!visible) this.close.emit();
  }
}

function toTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
