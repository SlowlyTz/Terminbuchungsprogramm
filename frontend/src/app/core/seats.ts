/**
 * How many people can be invited to a room. The organiser takes one of the
 * seats; a meeting that is also held as a video conference has no limit.
 */
export function inviteLimit(capacity: number, online: boolean): number {
  return online ? Infinity : Math.max(0, capacity - 1);
}

/** Toast shown when someone tries to invite more people than the room holds. */
export function seatLimitWarning(capacity: number): { summary: string; detail: string } {
  return {
    summary: `In diesem Raum ist nur Platz für ${capacity} ${capacity === 1 ? 'Person' : 'Personen'}.`,
    detail: 'Für weitere Teilnehmende unter „Weitere Angaben“ die Videokonferenz aktivieren.',
  };
}
