import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Start – Raumbuchung', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
  { path: 'buchen', title: 'Termin buchen – Raumbuchung', loadComponent: () => import('./pages/booking/booking').then((m) => m.Booking) },
  { path: 'meine-buchungen', title: 'Meine Buchungen – Raumbuchung', loadComponent: () => import('./pages/my-bookings/my-bookings').then((m) => m.MyBookings) },
  { path: 'raeume', title: 'Räume – Raumbuchung', loadComponent: () => import('./pages/rooms/rooms').then((m) => m.Rooms) },
  { path: 'benachrichtigungen', title: 'Benachrichtigungen – Raumbuchung', loadComponent: () => import('./pages/notifications/notifications').then((m) => m.Notifications) },
  { path: 'einstellungen', title: 'Einstellungen – Raumbuchung', loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings) },
  {
    path: 'verwaltung',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'raeume' },
      { path: 'raeume', title: 'Verwaltung: Räume – Raumbuchung', loadComponent: () => import('./pages/admin/admin-rooms').then((m) => m.AdminRooms) },
      { path: 'benutzer', title: 'Verwaltung: Benutzer – Raumbuchung', loadComponent: () => import('./pages/admin/admin-users').then((m) => m.AdminUsers) },
      { path: 'benutzer/neu', title: 'Neuer Benutzer – Raumbuchung', loadComponent: () => import('./pages/admin/admin-user-new').then((m) => m.AdminUserNew) },
      { path: 'audit', title: 'Audit-Log – Raumbuchung', loadComponent: () => import('./pages/admin/admin-audit').then((m) => m.AdminAudit) },
    ],
  },
  { path: '**', redirectTo: '' },
];
