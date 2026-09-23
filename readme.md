# Raumbuchung

Web-App zur Buchung von Meetingräumen.

Stack: Angular 21 + Optimus UI · Express 5 (Node 22) · MariaDB 10.11

## Struktur

```
backend/    Express-API, liefert den Angular-Build aus (Port 3000)
frontend/   Angular-App
db/         Schema, Migrationen, Seeds
docs/       Personas, Stack-Entscheidung
plan.md     Aufgabenverteilung
```

## Voraussetzungen

Node 22, npm ≥ 11, MariaDB.

## Schnellstart

Aus dem Projektordner, ohne nach `frontend/` zu wechseln:

```bash
npm run start         # startet das Frontend, http://localhost:4200
```

Beim ersten Mal vorher einmal `npm install` in `frontend/` ausführen.

## Frontend

```bash
cd frontend
npm install
npx ng serve          # http://localhost:4200
npx ng build          # Build nach frontend/dist
```

## Backend

```bash
cd backend
npm install
npm run dev           # http://localhost:3000, liefert frontend/dist aus, falls vorhanden
```

## Datenbank

```bash
sudo mysql -e "CREATE DATABASE raumbuchung CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER raumbuchung@localhost IDENTIFIED BY 'geheim';
GRANT SELECT, INSERT, UPDATE, DELETE ON raumbuchung.* TO raumbuchung@localhost;"
```

Zugangsdaten in `backend/.env`:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=raumbuchung
DB_USER=raumbuchung
DB_PASSWORD=geheim
```
