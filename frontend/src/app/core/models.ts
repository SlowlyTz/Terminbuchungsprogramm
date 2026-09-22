export interface User {
  id: number;
  name: string;
  role: string;
  isAdmin: boolean;
  avatarUrl: string | null;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  floor: string;
  equipment: string[];
}

export interface Booking {
  id: number;
  roomId: number;
  userId: number;
  userName: string;
  title: string;
  start: Date;
  end: Date;
  invitees: Invitee[];
}

export interface BookingDraft {
  roomId: number;
  date: Date;
  startTime: string; // "HH:mm"
  endTime: string;
  title: string;
  invitees: Invitee[];
}

export type Role = 'nutzer' | 'admin';

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: Role;
  active: boolean;
  lastLogin: Date | null;
}

export type AuditAction =
  | 'login'
  | 'logout'
  | 'booking_created'
  | 'booking_changed'
  | 'booking_cancelled'
  | 'user_created'
  | 'user_changed'
  | 'role_changed'
  | 'user_locked'
  | 'room_created'
  | 'room_changed'
  | 'room_deleted';

export interface AuditEntry {
  id: number;
  at: Date;
  userName: string;
  action: AuditAction;
  details: string;
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  login: 'Anmeldung',
  logout: 'Abmeldung',
  booking_created: 'Buchung angelegt',
  booking_changed: 'Buchung geändert',
  booking_cancelled: 'Buchung storniert',
  user_created: 'Benutzer angelegt',
  user_changed: 'Benutzer geändert',
  role_changed: 'Rolle geändert',
  user_locked: 'Benutzer gesperrt',
  room_created: 'Raum angelegt',
  room_changed: 'Raum geändert',
  room_deleted: 'Raum gelöscht',
};

export const ROLE_LABELS: Record<Role, string> = {
  nutzer: 'Nutzer',
  admin: 'Admin',
};

export interface Invitee {
  id: number;
  name: string;
  department: string;
  /** Reply of the invited person; undefined counts as still open. */
  status?: InvitationStatus;
}

export type InvitationStatus = 'open' | 'accepted' | 'declined';

export interface Invitation {
  id: number;
  fromName: string;
  title: string;
  roomId: number;
  start: Date;
  end: Date;
  createdAt: Date;
  status: InvitationStatus;
}
