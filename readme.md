# Raumbuchung

Web-App zur Buchung von Meetingräumen.

Stack: Angular 21 + Optimus UI · Express 5 (Node 22) · MariaDB 10.11

## Struktur

```
backend/    Express-API, liefert den Angular-Build aus (Port 3000)
frontend/   Angular-App
db/         Schema, Seeds, ERD
docs/       Personas, Stack-Entscheidung, Aufgabenplan
```

## Voraussetzungen

Node 22, npm ≥ 11, MariaDB.

## Start

```bash
npm run start         # Frontend auf http://localhost:4200
```

Beim ersten Mal vorher `npm install` in `frontend/` ausführen.

## Frontend

```bash
cd frontend
npm install
npm run start         # http://localhost:4200
npm run build         # Build nach frontend/dist
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
