import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '@openng/optimus-ui/api';
import { AvatarModule } from '@openng/optimus-ui/avatar';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { MenuModule } from '@openng/optimus-ui/menu';

import { AuthService } from '../../core/auth.service';
import { BootService } from '../../core/boot.service';
import { NotificationService } from '../../core/notification.service';
import { ThemeService } from '../../core/theme.service';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, AvatarModule, ButtonModule, DialogModule, MenuModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly boot = inject(BootService);
  readonly theme = inject(ThemeService);
  readonly notifications = inject(NotificationService);

  readonly showClose = input(false);
  readonly close = output<void>();

  readonly user = this.auth.user;
  readonly initials = this.auth.initials;

  /** Drives the icon animation; toggled on every theme switch. */
  readonly themeSpin = signal(false);
  readonly logoutOpen = signal(false);

  readonly nav: NavItem[] = [
    { label: 'Start', icon: 'pi pi-home', link: '/', exact: true },
    { label: 'Termin buchen', icon: 'pi pi-calendar-plus', link: '/buchen' },
    { label: 'Meine Buchungen', icon: 'pi pi-list', link: '/meine-buchungen' },
    { label: 'Räume', icon: 'pi pi-building', link: '/raeume' },
  ];

  // Opens upward automatically: the trigger sits at the bottom of the viewport.
  readonly profileMenu = computed<MenuItem[]>(() => [
    { id: 'notifications', label: 'Benachrichtigungen', icon: 'pi pi-bell', routerLink: '/benachrichtigungen' },
    { label: 'Einstellungen', icon: 'pi pi-cog', routerLink: '/einstellungen' },
    { label: 'Verwaltung', icon: 'pi pi-shield', routerLink: '/verwaltung', visible: this.auth.isAdmin() },
    { separator: true },
    {
      id: 'theme',
      label: this.theme.dark() ? 'Heller Modus' : 'Dunkler Modus',
      icon: this.theme.dark() ? 'pi pi-sun' : 'pi pi-moon',
      command: () => this.toggleTheme(),
    },
    { separator: true },
    { label: 'Abmelden', icon: 'pi pi-sign-out', command: () => this.logoutOpen.set(true) },
  ]);

  /** Called from the custom item template; keeps the menu open by swallowing the menu's own click handling. */
  onThemeClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleTheme();
  }

  confirmLogout(): void {
    this.logoutOpen.set(false);
    this.auth.logout();
    // So the next sign-in shows the loading skeleton again.
    this.boot.reset();
    this.router.navigate(['/anmelden']);
  }

  toggleTheme(): void {
    this.themeSpin.set(true);
    this.theme.toggle();
    setTimeout(() => this.themeSpin.set(false), 500);
  }
}
