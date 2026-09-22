import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * Mock only: keeps signed-out visitors on the login page. The real guard will
 * ask the backend for the session instead of reading a signal.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.signedIn()) return true;
  return router.createUrlTree(['/anmelden'], { queryParams: { weiter: state.url } });
};

/** Guards the administration area against users without admin rights. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return true;
  return router.createUrlTree(['/']);
};
