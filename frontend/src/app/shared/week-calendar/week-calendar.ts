import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import { Booking } from '../../core/models';

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  slots: CalendarSlot[];
  bookings: PlacedBooking[];
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

const SLOT_MINUTES = 30;

@Component({
  selector: 'app-week-calendar',
  imports: [DatePipe],
  templateUrl: './week-calendar.html',
  styleUrl: './week-calendar.scss',
})
export class WeekCalendar {
  readonly days = input.required<Date[]>();
  readonly bookings = input.required<Booking[]>();
  readonly currentUserId = input.required<number>();
  readonly hourStart = input(7);
  readonly hourEnd = input(19);

  readonly slotSelected = output<Date>();
  readonly bookingSelected = output<Booking>();

  readonly hours = computed(() => {
    const list: number[] = [];
    for (let h = this.hourStart(); h < this.hourEnd(); h++) list.push(h);
    return list;
  });

  readonly model = computed<CalendarDay[]>(() => {
    const dayMinutes = (this.hourEnd() - this.hourStart()) * 60;
    const today = new Date();
    const fmt = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
    return this.days().map((date) => {
      const dayStart = new Date(date);
      dayStart.setHours(this.hourStart(), 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(this.hourEnd(), 0, 0, 0);

      const dayBookings = this.bookings().filter((b) => b.start < dayEnd && b.end > dayStart);

      const slots: CalendarSlot[] = [];
      const now = Date.now();
      for (let m = 0; m < dayMinutes; m += SLOT_MINUTES) {
        const start = new Date(dayStart.getTime() + m * 60_000);
        const end = new Date(start.getTime() + SLOT_MINUTES * 60_000);
        const booked = dayBookings.some((b) => b.start < end && b.end > start);
        // Nothing can be booked in the past, so those slots are not offered either.
        const past = end.getTime() <= now;
        const time = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
        const state = booked ? 'belegt' : past ? 'vergangen' : 'frei, Buchung beginnen';
        slots.push({ start, booked, past, label: `${fmt.format(start)}, ${time} Uhr – ${state}` });
      }

      const placed: PlacedBooking[] = dayBookings.map((b) => {
        const s = Math.max(b.start.getTime(), dayStart.getTime());
        const e = Math.min(b.end.getTime(), dayEnd.getTime());
        const top = ((s - dayStart.getTime()) / 60_000 / dayMinutes) * 100;
        const height = ((e - s) / 60_000 / dayMinutes) * 100;
        return { booking: b, top, height, own: b.userId === this.currentUserId() };
      });

      return { date, isToday: sameDay(date, today), slots, bookings: placed };
    });
  });
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
