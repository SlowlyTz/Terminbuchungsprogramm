import { Routes } from '@angular/router';

import { adminGuard, authGuard } from './core/auth.guard';

/** Pages inside the application shell (sidebar, topbar, drawer). */
const shellRoutes: Routes = [
  { path: '', title: 'Start – Raumbuchung', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
  { path: 'kalender', title: 'Kalender – Raumbuchung', loadComponent: () => import('./pages/kalender/kalender').then((m) => m.Kalender) },
  // Old links and bookmarks keep working.
  { path: 'buchen', pathMatch: 'full', redirectTo: 'kalender' },
  { path: 'raeume', pathMatch: 'full', redirectTo: 'kalender' },
  { path: 'meine-buchungen', title: 'Meine Buchungen – Raumbuchung', loadComponent: () => import('./pages/my-bookings/my-bookings').then((m) => m.MyBookings) },
  { path: 'benachrichtigungen', title: 'Benachrichtigungen – Raumbuchung', loadComponent: () => import('./pages/notifications/notifications').then((m) => m.Notifications) },
  { path: 'einstellungen', title: 'Einstellungen – Raumbuchung', loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings) },
  {
    path: 'verwaltung',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'raeume' },
      { path: 'raeume', title: 'Verwaltung: Räume – Raumbuchung', loadComponent: () => import('./pages/admin/admin-rooms').then((m) => m.AdminRooms) },
      { path: 'benutzer', title: 'Verwaltung: Benutzer – Raumbuchung', loadComponent: () => import('./pages/admin/admin-users').then((m) => m.AdminUsers) },
      { path: 'benutzer/neu', title: 'Neuer Benutzer – Raumbuchung', loadComponent: () => import('./pages/admin/admin-user-new').then((m) => m.AdminUserNew) },
      { path: 'audit', title: 'Audit-Log – Raumbuchung', loadComponent: () => import('./pages/admin/admin-audit').then((m) => m.AdminAudit) },
    ],
  },
];

export const routes: Routes = [
  { path: 'anmelden', title: 'Anmelden – Raumbuchung', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  {
    path: 'passwort-vergessen',
    title: 'Passwort vergessen – Raumbuchung',
    loadComponent: () => import('./pages/password-reset/password-reset').then((m) => m.PasswordReset),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: shellRoutes,
  },
  { path: '**', redirectTo: '' },
];
