-- =====================================================================
-- 010_init_db.sql – Initiales Schema Raumbuchung (MariaDB 10.11)
-- Grundlage: db/entity-relationship-model.html
--
-- Ablauf: 1. Datenbank anlegen  2. Tabellen anlegen  3. Beziehungen (FKs)
-- Wiederholbar: legt nur fehlende Tabellen / Fremdschlüssel an,
-- bestehende Tabellen und Daten bleiben unverändert.
--
-- Zeitspalten werden in UTC gespeichert (plan.md). CURRENT_TIMESTAMP
-- nutzt die Zeitzone der Verbindung – Server/Verbindung auf '+00:00'.
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- 1. Datenbank
-- ---------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS raumbuchung
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE raumbuchung;

-- ---------------------------------------------------------------------
-- 2. Tabellen
-- ---------------------------------------------------------------------

-- Abteilungen der Mitarbeitenden
CREATE TABLE IF NOT EXISTS departments (
  department_id  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name           VARCHAR(100)  NOT NULL,
  is_active      BOOLEAN       NOT NULL DEFAULT 1,
  CONSTRAINT pk_departments PRIMARY KEY (department_id),
  CONSTRAINT uq_departments_name UNIQUE (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Berechtigungsrollen (Nutzer, Admin)
CREATE TABLE IF NOT EXISTS roles (
  role_id    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name       VARCHAR(50)   NOT NULL,
  is_active  BOOLEAN       NOT NULL DEFAULT 1,
  CONSTRAINT pk_roles PRIMARY KEY (role_id),
  CONSTRAINT uq_roles_name UNIQUE (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Mitarbeitende; ausscheiden = is_active 0, Verweise bleiben
CREATE TABLE IF NOT EXISTS users (
  user_id             INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  department_id       INT UNSIGNED      NULL,
  role_id             INT UNSIGNED      NULL,      -- NULL = Rolle wurde gelöscht
  email               VARCHAR(255)      NOT NULL,
  password_hash       CHAR(60)          NOT NULL,  -- bcrypt-Hash, immer 60 Zeichen
  first_name          VARCHAR(100)      NOT NULL,
  last_name           VARCHAR(100)      NOT NULL,
  failed_login_count  TINYINT UNSIGNED  NOT NULL DEFAULT 0,
  locked_until        DATETIME          NULL,
  is_active           BOOLEAN           NOT NULL DEFAULT 1,
  created_at          DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_users PRIMARY KEY (user_id),
  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Einmal-Tokens für „Passwort zurücksetzen“ (rein technisch, ohne is_active)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  password_reset_token_id  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id                  INT UNSIGNED  NOT NULL,
  token_hash               CHAR(64)      NOT NULL,  -- SHA-256
  expires_at               DATETIME      NOT NULL,
  used_at                  DATETIME      NULL,      -- NULL = noch nicht eingelöst
  created_at               DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_password_reset_tokens PRIMARY KEY (password_reset_token_id),
  CONSTRAINT uq_password_reset_tokens_token_hash UNIQUE (token_hash)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Session-Store von express-mysql-session (Struktur von der Bibliothek, kein FK)
CREATE TABLE IF NOT EXISTS sessions (
  session_id  VARCHAR(128)  CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  expires     INT UNSIGNED  NOT NULL,  -- Unix-Zeit
  data        MEDIUMTEXT    CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  CONSTRAINT pk_sessions PRIMARY KEY (session_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Buchbare Meetingräume
CREATE TABLE IF NOT EXISTS rooms (
  room_id      INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100)       NOT NULL,
  building     VARCHAR(100)       NULL,
  floor        VARCHAR(20)        NULL,
  capacity     SMALLINT UNSIGNED  NOT NULL,
  description  TEXT               NULL,
  is_active    BOOLEAN            NOT NULL DEFAULT 1,
  created_at   DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_rooms PRIMARY KEY (room_id),
  CONSTRAINT uq_rooms_name UNIQUE (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Ausstattungsmerkmale (Beamer, Whiteboard, …)
CREATE TABLE IF NOT EXISTS equipment (
  equipment_id  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)  NOT NULL,
  is_active     BOOLEAN       NOT NULL DEFAULT 1,
  CONSTRAINT pk_equipment PRIMARY KEY (equipment_id),
  CONSTRAINT uq_equipment_name UNIQUE (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Zwischentabelle rooms n:m equipment
CREATE TABLE IF NOT EXISTS room_equipment (
  room_equipment_id  INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  room_id            INT UNSIGNED       NOT NULL,
  equipment_id       INT UNSIGNED       NOT NULL,
  quantity           SMALLINT UNSIGNED  NOT NULL DEFAULT 1,
  is_active          BOOLEAN            NOT NULL DEFAULT 1,
  CONSTRAINT pk_room_equipment PRIMARY KEY (room_equipment_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Wiederholungsregel einer Terminserie
CREATE TABLE IF NOT EXISTS booking_series (
  booking_series_id  INT UNSIGNED                                NOT NULL AUTO_INCREMENT,
  frequency          ENUM('täglich', 'wöchentlich', 'monatlich') NOT NULL,
  interval_value     TINYINT UNSIGNED                            NOT NULL DEFAULT 1,
  until_date         DATE                                        NOT NULL,
  is_active          BOOLEAN                                     NOT NULL DEFAULT 1,
  CONSTRAINT pk_booking_series PRIMARY KEY (booking_series_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Eine Version einer Raumreservierung; Änderung = neue Zeile, alte wird inaktiv.
-- meeting_id bleibt über alle Versionen gleich und ist Ziel des FK aus
-- booking_participants; der Index darauf ist dafür Pflicht (InnoDB).
CREATE TABLE IF NOT EXISTS bookings (
  booking_id         INT UNSIGNED               NOT NULL AUTO_INCREMENT,
  meeting_id         INT UNSIGNED               NOT NULL,
  room_id            INT UNSIGNED               NULL,      -- NULL = Raum wurde gelöscht
  organizer_id       INT UNSIGNED               NULL,      -- NULL = Veranstalter wurde gelöscht
  booking_series_id  INT UNSIGNED               NULL,      -- NULL = Einzeltermin
  starts_at          DATETIME                   NOT NULL,  -- UTC
  ends_at            DATETIME                   NOT NULL,  -- UTC
  title              VARCHAR(200)               NULL,
  description        TEXT                       NULL,
  guest_count        SMALLINT UNSIGNED          NOT NULL DEFAULT 0,
  note               VARCHAR(255)               NULL,      -- Hinweis, z. B. Catering-Wunsch
  status             ENUM('geplant', 'abgesagt') NOT NULL DEFAULT 'geplant',
  created_by_id      INT UNSIGNED               NULL,      -- NULL = Ersteller wurde gelöscht
  created_at         DATETIME                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active          BOOLEAN                    NOT NULL DEFAULT 1,  -- 1 = aktuelle Version
  deactivated_by_id  INT UNSIGNED               NULL,
  deactivated_at     DATETIME                   NULL,
  CONSTRAINT pk_bookings PRIMARY KEY (booking_id),
  INDEX ix_bookings_meeting (meeting_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Zwischentabelle users n:m bookings: Einladung einer Person zu einem Meeting (über meeting_id).
-- Unveränderlich: Antwort = neue Zeile, Entfernen = is_active 0.
CREATE TABLE IF NOT EXISTS booking_participants (
  booking_participant_id  INT UNSIGNED                                    NOT NULL AUTO_INCREMENT,
  meeting_id              INT UNSIGNED                                    NOT NULL,
  user_id                 INT UNSIGNED                                    NOT NULL,
  role                    ENUM('pflicht', 'optional')                     NOT NULL,
  status                  ENUM('eingeladen', 'angenommen', 'abgelehnt')   NOT NULL,
  comment                 VARCHAR(255)                                    NULL,
  created_by_id           INT UNSIGNED                                    NULL,      -- NULL = Ersteller wurde gelöscht
  created_at              DATETIME                                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active               BOOLEAN                                         NOT NULL DEFAULT 1,
  deactivated_by_id       INT UNSIGNED                                    NULL,
  deactivated_at          DATETIME                                        NULL,
  CONSTRAINT pk_booking_participants PRIMARY KEY (booking_participant_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Beziehungen (Fremdschlüssel)
-- Löschen ist erlaubt (üblich bleibt deaktivieren). Grundsatz:
--   CASCADE  = Datensatz ist ohne sein Gegenstück sinnlos -> wird mitgelöscht
--   SET NULL = Verweis ist optional oder reine Protokollangabe -> wird geleert;
--              Meetings werden so nie automatisch mitgelöscht.
-- ON UPDATE CASCADE überall: geänderte IDs werden mitgezogen.
-- ---------------------------------------------------------------------

-- users gehört zu departments (n:1) / hat Rolle (n:1)
ALTER TABLE users
  ADD CONSTRAINT fk_users_department FOREIGN KEY IF NOT EXISTS (department_id)
    REFERENCES departments (department_id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_users_role FOREIGN KEY IF NOT EXISTS (role_id)
    REFERENCES roles (role_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- password_reset_tokens gehört zu users (n:1)
ALTER TABLE password_reset_tokens
  ADD CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY IF NOT EXISTS (user_id)
    REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE;

-- room_equipment: rooms n:m equipment
ALTER TABLE room_equipment
  ADD CONSTRAINT fk_room_equipment_room FOREIGN KEY IF NOT EXISTS (room_id)
    REFERENCES rooms (room_id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_room_equipment_equipment FOREIGN KEY IF NOT EXISTS (equipment_id)
    REFERENCES equipment (equipment_id) ON DELETE CASCADE ON UPDATE CASCADE;

-- bookings belegt rooms, gehört zu booking_series, users bucht / bearbeitet
ALTER TABLE bookings
  ADD CONSTRAINT fk_bookings_room FOREIGN KEY IF NOT EXISTS (room_id)
    REFERENCES rooms (room_id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_bookings_series FOREIGN KEY IF NOT EXISTS (booking_series_id)
    REFERENCES booking_series (booking_series_id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_bookings_organizer FOREIGN KEY IF NOT EXISTS (organizer_id)
    REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_bookings_created_by FOREIGN KEY IF NOT EXISTS (created_by_id)
    REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_bookings_deactivated_by FOREIGN KEY IF NOT EXISTS (deactivated_by_id)
    REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- booking_participants: bookings lädt ein (über meeting_id), users nimmt teil
ALTER TABLE booking_participants
  ADD CONSTRAINT fk_booking_participants_meeting FOREIGN KEY IF NOT EXISTS (meeting_id)
    REFERENCES bookings (meeting_id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_booking_participants_user FOREIGN KEY IF NOT EXISTS (user_id)
    REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_booking_participants_created_by FOREIGN KEY IF NOT EXISTS (created_by_id)
    REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_booking_participants_deactivated_by FOREIGN KEY IF NOT EXISTS (deactivated_by_id)
    REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE;
