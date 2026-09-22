import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DrawerModule } from '@openng/optimus-ui/drawer';
import { filter } from 'rxjs';

import { BootService } from '../../core/boot.service';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, AppSkeleton, Sidebar, ButtonModule, DrawerModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly router = inject(Router);
  readonly boot = inject(BootService);

  readonly drawerOpen = signal(false);

  constructor() {
    // The shell is mounted once per session, so the fake initial load runs once.
    this.boot.start();

    // Close the mobile drawer after every navigation.
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.drawerOpen.set(false));
  }
}
