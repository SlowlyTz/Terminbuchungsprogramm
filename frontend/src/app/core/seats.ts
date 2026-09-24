/** How many people can be invited to attend in the room: the organiser takes one of the seats. */
export function seatLimit(capacity: number): number {
  return Math.max(0, capacity - 1);
}

/** Toast shown when someone tries to invite more people to the room than it holds. */
export function seatLimitWarning(capacity: number, online: boolean): { summary: string; detail: string } {
  return {
    summary: 'Raum ist voll',
    detail: online
      ? `Nur ${capacity} Plätze. Weitere Personen unter „Online zugeschaltet“ einladen.`
      : `Nur ${capacity} Plätze. Weitere Personen per Videokonferenz zuschalten.`,
  };
}
