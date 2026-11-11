import { DatePipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, afterRenderEffect, computed, inject, input, output, signal } from '@angular/core';

import { Booking } from '../../core/models';

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  slots: CalendarSlot[];
  bookings: PlacedBooking[];
  /** Position of the current time in percent, only for today within the visible hours. */
  nowTop: number | null;
}

export interface CalendarSlot {
  start: Date;
  booked: boolean;
  past: boolean;
  label: string;
}

export interface PlacedBooking {
  booking: Booking;
  top: number; // percent
  height: number; // percent
  own: boolean;
}

/** A pending selection on one day, as slot indices (both inclusive). */
interface SlotRange {
  day: number;
  from: number;
  to: number;
}

const SLOT_MINUTES = 30;
/** A plain click proposes one hour. */
const DEFAULT_SLOTS = 2;

@Component({
  selector: 'app-week-calendar',
  imports: [DatePipe],
  templateUrl: './week-calendar.html',
  styleUrl: './week-calendar.scss',
  host: { '(document:keydown.escape)': 'cancelDrag()' },
})
export class WeekCalendar {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly days = input.required<Date[]>();
  readonly bookings = input.required<Booking[]>();
  readonly currentUserId = input.required<number>();
  readonly hourStart = input(7);
  readonly hourEnd = input(19);
  /** A booking that was just created; it pulses once and is scrolled into view. */
  readonly highlightId = input<number | null>(null);

  readonly rangeSelected = output<{ start: Date; end: Date }>();
  readonly bookingSelected = output<Booking>();

  /** Refreshed every minute so the now line moves and slots turn past. */
  readonly now = signal(new Date());

  private readonly hover = signal<{ day: number; slot: number } | null>(null);
  private readonly drag = signal<{ day: number; anchor: number; current: number } | null>(null);
  readonly dragging = computed(() => this.drag() !== null);
  /** Set between a pointer release and the click that follows it, so the click does not emit twice. */
  private pointerHandled = false;
  private scrolledToNow = false;
  private scrolledToId: number | null = null;

  readonly hours = computed(() => {
    const list: number[] = [];
    for (let h = this.hourStart(); h < this.hourEnd(); h++) list.push(h);
    return list;
  });

  readonly model = computed<CalendarDay[]>(() => {
    const dayMinutes = (this.hourEnd() - this.hourStart()) * 60;
    const today = this.now();
    const now = today.getTime();
    const fmt = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
    return this.days().map((date) => {
      const dayStart = new Date(date);
      dayStart.setHours(this.hourStart(), 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(this.hourEnd(), 0, 0, 0);

      const dayBookings = this.bookings().filter((b) => b.start < dayEnd && b.end > dayStart);

      const slots: CalendarSlot[] = [];
      for (let m = 0; m < dayMinutes; m += SLOT_MINUTES) {
        const start = new Date(dayStart.getTime() + m * 60_000);
        const end = new Date(start.getTime() + SLOT_MINUTES * 60_000);
        const booked = dayBookings.some((b) => b.start < end && b.end > start);
        // Nothing can be booked in the past, so those slots are not offered either.
        const past = end.getTime() <= now;
        const state = booked ? 'belegt' : past ? 'vergangen' : 'frei, Buchung beginnen';
        slots.push({ start, booked, past, label: `${fmt.format(start)}, ${hhmm(start)} Uhr – ${state}` });
      }

      const placed: PlacedBooking[] = dayBookings.map((b) => {
        const s = Math.max(b.start.getTime(), dayStart.getTime());
        const e = Math.min(b.end.getTime(), dayEnd.getTime());
        const top = ((s - dayStart.getTime()) / 60_000 / dayMinutes) * 100;
        const height = ((e - s) / 60_000 / dayMinutes) * 100;
        return { booking: b, top, height, own: b.userId === this.currentUserId() };
      });

      const isToday = sameDay(date, today);
      const inHours = now >= dayStart.getTime() && now < dayEnd.getTime();
      const nowTop = isToday && inHours ? ((now - dayStart.getTime()) / 60_000 / dayMinutes) * 100 : null;

      return { date, isToday, slots, bookings: placed, nowTop };
    });
  });

  /** The ghost block: the live drag range, otherwise the hour a click on the hovered slot would propose. */
  readonly ghost = computed(() => {
    const d = this.drag();
    const h = this.hover();
    let range: SlotRange | null = null;
    if (d) range = this.dragRange(d.day, d.anchor, d.current);
    else if (h && this.isFree(h.day, h.slot)) range = this.clickRange(h.day, h.slot);
    if (!range) return null;

    const slots = this.model()[range.day].slots;
    const start = slots[range.from].start;
    const end = new Date(slots[range.to].start.getTime() + SLOT_MINUTES * 60_000);
    return {
      day: range.day,
      top: (range.from / slots.length) * 100,
      height: ((range.to - range.from + 1) / slots.length) * 100,
      label: `${hhmm(start)}–${hhmm(end)}` + (d ? '' : ' · buchen'),
    };
  });

  constructor() {
    const timer = setInterval(() => this.now.set(new Date()), 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));

    afterRenderEffect(() => {
      const id = this.highlightId();
      this.model();
      if (id === null || id === this.scrolledToId) return;
      const el = this.host.nativeElement.querySelector(`[data-booking-id="${id}"]`);
      if (!el) return;
      this.scrolledToId = id;
      el.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() });
    });

    afterRenderEffect(() => {
      this.model();
      if (this.scrolledToNow) return;
      // A fresh booking takes precedence over the current time.
      if (this.highlightId() !== null) {
        this.scrolledToNow = true;
        return;
      }
      const line = this.host.nativeElement.querySelector('.cal__now');
      if (!line) return;
      this.scrolledToNow = true;
      line.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
    });
  }

  onPointerDown(event: PointerEvent, day: number): void {
    // Touch keeps scrolling the page; a tap still books through the click handler.
    if (event.button !== 0 || event.pointerType === 'touch') return;
    const slot = this.slotAt(event, day);
    if (!this.isFree(day, slot)) return;
    event.preventDefault(); // no text selection while dragging
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.drag.set({ day, anchor: slot, current: slot });
  }

  onPointerMove(event: PointerEvent, day: number): void {
    const d = this.drag();
    if (d) {
      if (d.day === day) this.drag.set({ ...d, current: this.slotAt(event, day) });
      return;
    }
    if (event.pointerType !== 'touch') this.hover.set({ day, slot: this.slotAt(event, day) });
  }

  onPointerUp(day: number): void {
    const d = this.drag();
    if (!d || d.day !== day) return;
    this.drag.set(null);
    this.pointerHandled = true;
    setTimeout(() => (this.pointerHandled = false));
    const range = d.anchor === d.current ? this.clickRange(day, d.anchor) : this.dragRange(day, d.anchor, d.current);
    this.emitRange(range);
  }

  onPointerLeave(): void {
    if (!this.drag()) this.hover.set(null);
  }

  /** Keyboard activation (and taps) land here; pointer drags have already emitted. */
  onSlotClick(day: number, slot: number): void {
    if (this.pointerHandled) return;
    this.emitRange(this.clickRange(day, slot));
  }

  cancelDrag(): void {
    if (this.drag()) {
      this.drag.set(null);
      this.hover.set(null);
    }
  }

  private emitRange(range: SlotRange | null): void {
    if (!range) return;
    const slots = this.model()[range.day].slots;
    const start = slots[range.from].start;
    const end = new Date(slots[range.to].start.getTime() + SLOT_MINUTES * 60_000);
    this.rangeSelected.emit({ start, end });
  }

  private isFree(day: number, slot: number): boolean {
    const s = this.model()[day]?.slots[slot];
    return !!s && !s.booked && !s.past;
  }

  /** One hour from the slot, cut short before the next booking or the end of the day. */
  private clickRange(day: number, slot: number): SlotRange | null {
    if (!this.isFree(day, slot)) return null;
    let to = slot;
    while (to - slot + 1 < DEFAULT_SLOTS && this.isFree(day, to + 1)) to++;
    return { day, from: slot, to };
  }

  /** From the anchor towards the pointer, stopping before the first booked or past slot. */
  private dragRange(day: number, anchor: number, current: number): SlotRange | null {
    if (!this.isFree(day, anchor)) return null;
    let from = anchor;
    let to = anchor;
    while (to < current && this.isFree(day, to + 1)) to++;
    while (from > current && this.isFree(day, from - 1)) from--;
    return { day, from, to };
  }

  private slotAt(event: PointerEvent, day: number): number {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const count = this.model()[day].slots.length;
    const i = Math.floor(((event.clientY - rect.top) / rect.height) * count);
    return Math.min(count - 1, Math.max(0, i));
  }
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function scrollBehavior(): ScrollBehavior {
  return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}
