import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { MessageService } from '@openng/optimus-ui/api';
import { provideOptimus } from '@openng/optimus-ui/config';
import Aura from '@openng/optimus-ui-themes/aura';

import { routes } from './app.routes';

registerLocaleData(localeDe);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    MessageService,
    { provide: LOCALE_ID, useValue: 'de' },
    provideOptimus({
      ripple: false,
      theme: {
        preset: Aura,
        // Keep the light theme regardless of the OS setting; dark mode is opt-in via this class.
        options: { darkModeSelector: '.app-dark' },
      },
      translation: {
        firstDayOfWeek: 1,
        dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
        dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        today: 'Heute',
        clear: 'Leeren',
        emptyMessage: 'Keine Einträge',
        emptyFilterMessage: 'Kein Raum gefunden',
        searchMessage: '{0} Ergebnisse',
        selectionMessage: '{0} ausgewählt',
        emptySelectionMessage: 'Nichts ausgewählt',
        accept: 'Ja',
        reject: 'Nein',
        chooseDate: 'Datum wählen',
        aria: {
          trueLabel: 'Ja',
          falseLabel: 'Nein',
          close: 'Schließen',
          navigation: 'Navigation',
          previous: 'Zurück',
          next: 'Weiter',
          selectAll: 'Alle auswählen',
          unselectAll: 'Auswahl aufheben',
          filter: 'Filtern',
          previousMonth: 'Vorheriger Monat',
          nextMonth: 'Nächster Monat',
          previousYear: 'Vorheriges Jahr',
          nextYear: 'Nächstes Jahr',
          chooseDate: 'Datum wählen',
          chooseTime: 'Uhrzeit wählen',
          prevHour: 'Vorherige Stunde',
          nextHour: 'Nächste Stunde',
          prevMinute: 'Vorherige Minute',
          nextMinute: 'Nächste Minute',
          selectRow: 'Zeile auswählen',
          unselectRow: 'Zeile abwählen',
        } as never,
      },
    }),
  ],
};
