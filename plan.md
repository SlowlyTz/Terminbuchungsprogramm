# Terminbuchungsprogramm – Raumbuchung

Web-Anwendung zur Buchung von Meetingräumen, ca. 300 Mitarbeitende, gemischte IT-Kenntnisse.

## Stack (laut Stack-Entscheidung, Variante A)

| Schicht   | Technologie                                            |
|-----------|--------------------------------------------------------|
| Frontend  | Angular 21 + Optimus UI (MIT, PrimeNG-Fork, WCAG 2.1 AA) |
| Backend   | Express.js als REST-API (JavaScript, Node.js)          |
| Datenbank | MariaDB, Zugriff über Prepared Statements              |
| Anmeldung | eigene Benutzerverwaltung, bcrypt-Hashes, express-session (Session-Cookies) |

Offene Punkte aus dem Kundengespräch (AD/M365-Login, Outlook-Anbindung, wiederkehrende Termine,
Vertretungsregelung, Hosting) werden erst nach Klärung eingeplant.

## Repository-Struktur

```
/db        Schema, Migrationen, Seed-Daten, docker-compose (Paul)
/backend   Express-API (Luca)
/frontend  Angular-App (Emilio: Komponenten/UI, Luca: Services/Guards)
/docs      API-Vertrag, ER-Diagramm, Testprotokolle
```

## Aufteilung der Aufgaben

Grundsatz: Jeder besitzt eine Schicht vollständig – inkl. Tests und Doku dafür.
Übergaben laufen über feste Verträge (Schema → API → UI), damit parallel gearbeitet werden kann.

### 1. Paul – Datenbank (MariaDB)

Verantwortet alles, was in der Datenbank passiert. Kein JS/Angular nötig.

- **ER-Modell und Schema**: `users`, `rooms`, `bookings`, ggf. `equipment` / `room_equipment`, `sessions`
  (für express-session-Store). Constraints, Fremdschlüssel, Indizes (z. B. auf `bookings(room_id, start, end)`).
- **Migrationen**: nummerierte SQL-Skripte (`001_init.sql`, …) plus Rollback; Versionierung dokumentieren.
- **Seed-Daten**: Testräume, Testnutzer (Passwort-Hashes liefert Luca), Beispielbuchungen für Demo und Tests.
- **Fachliche Regeln in der DB**: Überschneidungsprüfung für Buchungen (CHECK/Trigger oder View für
  Verfügbarkeit), `end > start`, keine Buchung in der Vergangenheit.
- **Alle SQL-Statements der Anwendung** als Datei `db/queries.sql` mit Platzhaltern `?` – Luca bindet sie
  1:1 als Prepared Statements ein: Login-Lookup, Räume listen/filtern (Kapazität, Ausstattung),
  Verfügbarkeit pro Zeitraum, Buchung anlegen/ändern/stornieren, eigene Buchungen, Admin-Übersicht.
- **Betrieb**: `docker-compose.yml` für lokale MariaDB, Backup-/Restore-Skript, Benutzer/Rechte
  (App-User ohne DDL-Rechte), Zeichensatz/Zeitzone (`utf8mb4`, UTC).
- **Tests**: SQL-Testskripte für Überschneidungen und Constraints; Performance-Check mit ~10 000 Buchungen (EXPLAIN).
- **Doku**: ER-Diagramm und Schemabeschreibung in `/docs`.

### 2. Emilio – UI / Design (Angular + Optimus UI)

Verantwortet alles, was der Nutzer sieht und bedient. Datenanbindung kommt von Luca über Services.

- **Design-Grundlage**: Wireframes/Klickdummy aus den Personas, Farb- und Typografie-Theme für Optimus UI
  (Kontraste ≥ 4,5:1, Schriftgrößen für seltene Nutzer), Layout-Shell (Header, Navigation, Content).
- **Seiten und Komponenten**:
  - Login-Seite
  - Raumübersicht mit Filter (Kapazität, Ausstattung) – Optimus `Table` / `MultiSelect`
  - Verfügbarkeits-/Kalenderansicht pro Raum und Tag/Woche
  - Buchungsformular (DatePicker, Uhrzeit, Titel, Teilnehmerzahl) mit Validierungs-Feedback
  - „Meine Buchungen" mit Ändern/Stornieren
  - Admin-Ansicht: Räume und Nutzer verwalten
  - Fehler-, Lade- und Leerzustände, Toast-Meldungen
- **Barrierefreiheit (WCAG 2.1 AA)**: vollständige Tastaturbedienung, Fokusreihenfolge, ARIA-Labels,
  Screenreader-Test, Kontrastprüfung; Ergebnisse als Checkliste in `/docs`.
- **Responsive**: Desktop-first, nutzbar auf Tablet.
- **Tests**: Komponententests (Rendering, Formularvalidierung), manueller A11y-Testlauf.

### 3. Luca – Backend, Auth und Integration

Verantwortet die Verbindung zwischen DB und UI sowie Projektinfrastruktur.

- **Projekt-Setup**: Monorepo anlegen, Backend in plain JavaScript (ES-Module, Frontend bleibt Angular/TypeScript), ESLint/Prettier, `npm`-Skripte, `.env`-Handling,
  README mit Startanleitung, CI (Lint + Tests).
- **Express-REST-API**: Routen für Auth, Räume, Buchungen, Nutzer; Eingabevalidierung; einheitliches
  Fehlerformat; Rollen (Nutzer/Admin). Pauls Queries als Prepared Statements über `mariadb`-Treiber einbinden.
- **Authentifizierung**: Registrierung/Anlegen durch Admin, Login/Logout mit bcrypt und express-session
  (Session-Store in MariaDB), Passwort zurücksetzen, Sperrung nach Fehlversuchen, CSRF-Schutz, Security-Header.
- **API-Vertrag**: OpenAPI-Datei in `/docs` als Schnittstelle zu Emilio – früh liefern, damit UI und
  Backend parallel entstehen (Mock-Antworten bis die API steht).
- **Angular-Anbindung**: `HttpClient`-Services, Auth-Guard, Interceptor (Session/401-Handling), Routing,
  DTO-Typen im Frontend aus dem OpenAPI-Vertrag ableiten.
- **Tests**: API-Tests (Supertest) inkl. Überschneidungsfälle und Rechteprüfung; End-to-End-Smoke-Test
  Login → Buchung anlegen → stornieren.

## Schnittstellen und Reihenfolge

| Woche | Paul                          | Emilio                                | Luca                                   |
|-------|-------------------------------|---------------------------------------|----------------------------------------|
| 1     | ER-Modell, Schema, Compose    | Wireframes, Theme, Layout-Shell       | Repo-Setup, API-Vertrag (OpenAPI), Mocks |
| 2     | Migrationen, Seeds, Queries   | Login, Raumübersicht, Buchungsformular | Auth, Räume-/Buchungs-Routen           |
| 3     | Trigger/Views, Tests, Perf    | Kalenderansicht, Meine Buchungen, Admin | Angular-Services/Guards, API-Tests    |
| 4     | Backup, Doku, Feinschliff     | A11y-Testlauf, Responsive, Feinschliff | Integration, E2E, README, Bugfixing   |

Übergabepunkte:
1. **Ende Woche 1**: Schema (Paul) und API-Vertrag (Luca) sind eingefroren – Änderungen danach nur abgestimmt.
2. **Ende Woche 2**: Queries (Paul → Luca), erste Routen laufen gegen die echte DB.
3. **Ende Woche 3**: UI hängt an der echten API statt an Mocks.

## Definition of Done (für jede Aufgabe)

- Code im Repo, Lint und Tests grün, kurze Doku in `/docs` oder README.
- Von einer zweiten Person kurz gegengeprüft (Paul ↔ Luca für DB/API, Emilio ↔ Luca für UI/Services).
