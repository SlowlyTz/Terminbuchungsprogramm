import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';
import { MultiSelectModule } from '@openng/optimus-ui/multiselect';
import { SelectModule } from '@openng/optimus-ui/select';
import { TableModule } from '@openng/optimus-ui/table';
import { TagModule } from '@openng/optimus-ui/tag';

import { AdminDataService } from '../../core/admin-data.service';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { Room } from '../../core/models';
import { Notify } from '../../core/notify.service';
import { EmptyState } from '../../shared/empty-state/empty-state';

const FLOORS = ['EG', '1. OG', '2. OG', '3. OG', 'UG'];
const EQUIPMENT = ['Beamer', 'Whiteboard', 'Bildschirm', 'Videokonferenz', 'Telefon', 'Flipchart'];

interface RoomDraft {
  name: string;
  floor: string | null;
  capacity: number | null;
  equipment: string[];
}

const EMPTY_DRAFT: RoomDraft = { name: '', floor: null, capacity: null, equipment: [] };

@Component({
  selector: 'app-admin-rooms',
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    MultiSelectModule,
    SelectModule,
    TableModule,
    TagModule,
    EmptyState,
  ],
  templateUrl: './admin-rooms.html',
  styleUrl: './admin-rooms.scss',
})
export class AdminRooms {
  readonly data = inject(DataService);
  private readonly admin = inject(AdminDataService);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(Notify);

  readonly floors = FLOORS;
  readonly equipmentOptions = EQUIPMENT;

  /** Room being edited; null while the dialog is closed, 0 means "new room". */
  readonly editingId = signal<number | null>(null);
  readonly draft = signal<RoomDraft>({ ...EMPTY_DRAFT });
  readonly submitted = signal(false);
  readonly toDelete = signal<Room | null>(null);

  readonly dialogOpen = computed(() => this.editingId() !== null);
  readonly isNew = computed(() => this.editingId() === 0);

  readonly nameTaken = computed(() => {
    const name = this.draft().name.trim().toLowerCase();
    const id = this.editingId();
    return name !== '' && this.data.rooms().some((r) => r.id !== id && r.name.toLowerCase() === name);
  });
  readonly invalid = computed(() => {
    const d = this.draft();
    return d.name.trim() === '' || !d.floor || !d.capacity || d.capacity < 1 || this.nameTaken();
  });

  /** Future bookings block deletion; showing the count explains why. */
  readonly blockingBookings = computed(() => {
    const r = this.toDelete();
    return r ? this.data.futureBookings(r.id) : [];
  });

  bookingCount(roomId: number): number {
    return this.data.futureBookings(roomId).length;
  }

  newRoom(): void {
    this.draft.set({ ...EMPTY_DRAFT });
    this.submitted.set(false);
    this.editingId.set(0);
  }

  editRoom(r: Room): void {
    this.draft.set({ name: r.name, floor: r.floor, capacity: r.capacity, equipment: [...r.equipment] });
    this.submitted.set(false);
    this.editingId.set(r.id);
  }

  patch(p: Partial<RoomDraft>): void {
    this.draft.update((d) => ({ ...d, ...p }));
  }

  save(): void {
    this.submitted.set(true);
    if (this.invalid()) return;

    const d = this.draft();
    const values = { name: d.name.trim(), floor: d.floor!, capacity: d.capacity!, equipment: d.equipment };
    const actor = this.auth.user().name;

    if (this.isNew()) {
      const created = this.data.createRoom(values);
      this.admin.log(actor, 'room_created', `${created.name} (${created.floor}), ${created.capacity} Plätze`);
      this.notify.success(`Raum ${created.name} kann jetzt gebucht werden.`, 'Raum angelegt');
    } else {
      const updated = this.data.updateRoom(this.editingId()!, values);
      if (updated) {
        this.admin.log(actor, 'room_changed', `${updated.name} (${updated.floor}), ${updated.capacity} Plätze`);
        this.notify.success(`Raum ${updated.name}.`, 'Änderungen gespeichert');
      }
    }
    this.editingId.set(null);
  }

  confirmDelete(): void {
    const r = this.toDelete();
    if (!r || this.blockingBookings().length > 0) return;
    this.data.deleteRoom(r.id);
    this.admin.log(this.auth.user().name, 'room_deleted', `${r.name} (${r.floor})`);
    this.notify.success(`Raum ${r.name} wurde gelöscht.`, 'Raum gelöscht');
    this.toDelete.set(null);
  }
}
