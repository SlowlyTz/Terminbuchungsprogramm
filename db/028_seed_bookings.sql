-- =====================================================================
-- Generiert Testdaten für bookings
-- =====================================================================

SET NAMES utf8mb4;
USE raumbuchung;

START TRANSACTION;

INSERT INTO bookings (meeting_id, room_id, organizer_id, booking_series_id, starts_at, ends_at, title, description, guest_count, note, status, created_by_id, created_at, is_active, deactivated_by_id, deactivated_at) VALUES
  (1, 1, 15, NULL, '2026-09-21 08:00:00', '2026-09-21 09:30:00', 'Vertriebsrunde Q4-Planung', NULL, 0, NULL, 'geplant', 15, '2026-09-14 09:12:00', 1, NULL, NULL),
  (2, 6, 2, NULL, '2026-09-22 11:00:00', '2026-09-22 12:00:00', 'Bewerbungsgespräch Softwareentwicklung', NULL, 1, NULL, 'geplant', 2, '2026-09-15 14:30:00', 1, NULL, NULL),
  (3, 3, 6, NULL, '2026-09-23 13:00:00', '2026-09-23 13:30:00', 'Code-Review Zahlungsmodul', NULL, 0, NULL, 'geplant', 6, '2026-09-23 12:48:00', 1, NULL, NULL),
  (4, 1, 16, NULL, '2026-09-25 08:00:00', '2026-09-25 10:00:00', 'Angebotspräsentation Kunde', NULL, 3, 'Kaffee und Wasser für 6 Personen', 'geplant', 16, '2026-09-17 10:05:00', 1, NULL, NULL),
  (5, 4, 17, NULL, '2026-09-28 07:30:00', '2026-09-28 09:00:00', 'Kampagnenplanung Frühjahr 2027', NULL, 0, NULL, 'geplant', 17, '2026-09-21 16:20:00', 1, NULL, NULL),
  (6, 1, 13, NULL, '2026-09-29 12:00:00', '2026-09-29 13:00:00', 'Lieferantengespräch Büromöbel', 'Lieferant hat den Termin kurzfristig abgesagt.', 2, NULL, 'abgesagt', 13, '2026-09-10 11:00:00', 1, NULL, NULL),
  (7, 7, 6, NULL, '2026-09-30 08:00:00', '2026-09-30 10:00:00', 'IT-Sicherheitsschulung', 'Pflichtschulung zu Phishing und Passwortsicherheit.', 0, NULL, 'geplant', 6, '2026-09-08 08:45:00', 1, NULL, NULL),
  (8, 3, 11, 2, '2026-10-01 08:00:00', '2026-10-01 09:00:00', 'Projektabstimmung Kundenportal', NULL, 0, NULL, 'geplant', 11, '2026-09-18 13:00:00', 1, NULL, NULL),
  (9, 2, 5, NULL, '2026-10-01 11:00:00', '2026-10-01 13:00:00', 'Budgetplanung 2027', NULL, 0, NULL, 'geplant', 5, '2026-09-16 09:30:00', 1, NULL, NULL),
  (10, 6, 3, NULL, '2026-10-02 09:00:00', '2026-10-02 09:30:00', 'Personalgespräch', 'Vertrauliches Gespräch.', 0, NULL, 'geplant', 3, '2026-09-24 08:10:00', 1, NULL, NULL),
  (11, 7, 3, 1, '2026-10-05 07:00:00', '2026-10-05 10:00:00', 'Onboarding-Schulung neue Mitarbeitende', NULL, 4, 'Namensschilder und Kaffee bereitstellen', 'geplant', 3, '2026-09-11 10:00:00', 1, NULL, NULL),
  (12, 7, 3, 1, '2026-10-06 07:00:00', '2026-10-06 10:00:00', 'Onboarding-Schulung neue Mitarbeitende', NULL, 4, 'Namensschilder und Kaffee bereitstellen', 'geplant', 3, '2026-09-11 10:00:00', 1, NULL, NULL),
  (13, 2, 4, 4, '2026-10-06 07:00:00', '2026-10-06 09:00:00', 'Monatsabschluss Buchhaltung', NULL, 0, NULL, 'geplant', 4, '2026-09-02 08:30:00', 1, NULL, NULL),
  (14, 4, 12, NULL, '2026-10-07 07:00:00', '2026-10-07 10:00:00', 'Workshop Kundenportal UX', NULL, 0, 'Mittagssnack für 6 Personen', 'geplant', 12, '2026-09-22 15:40:00', 1, NULL, NULL),
  (15, 3, 11, 2, '2026-10-08 08:00:00', '2026-10-08 09:00:00', 'Projektabstimmung Kundenportal', 'Entfällt wegen UX-Workshop am 07.10.', 0, NULL, 'abgesagt', 11, '2026-09-18 13:00:00', 1, NULL, NULL),
  (16, 5, 15, NULL, '2026-10-08 13:00:00', '2026-10-08 14:00:00', 'Videocall Rahmenvertrag Kunde', NULL, 0, NULL, 'geplant', 15, '2026-09-23 11:15:00', 1, NULL, NULL),
  (17, 5, 8, 3, '2026-10-12 12:00:00', '2026-10-12 13:00:00', 'Sprint-Review Softwareentwicklung', NULL, 0, NULL, 'geplant', 8, '2026-09-14 10:00:00', 1, NULL, NULL),
  (18, 8, 18, NULL, '2026-10-13 08:00:00', '2026-10-13 09:00:00', 'Teamrunde Marketing', 'Abgesagt, Raum C_02 wegen Umbau gesperrt.', 0, NULL, 'abgesagt', 18, '2026-08-31 14:00:00', 1, NULL, NULL),
  (19, 3, 2, NULL, '2026-10-14 08:00:00', '2026-10-14 09:00:00', 'Abstimmung Stellenausschreibungen', NULL, 0, NULL, 'geplant', 2, '2026-09-21 09:00:00', 1, NULL, NULL),
  (20, 7, 1, 5, '2026-10-15 12:00:00', '2026-10-15 13:30:00', 'Quartals-Betriebsversammlung', 'Quartalsbericht der Geschäftsleitung. Vor Ort max. 60 Plätze.', 45, 'Bestuhlung in Reihen', 'geplant', 2, '2026-07-01 09:00:00', 1, NULL, NULL),
  (21, 4, 17, NULL, '2026-10-20 11:00:00', '2026-10-20 13:00:00', 'Messevorbereitung', 'Messeteilnahme wurde gestrichen.', 0, NULL, 'abgesagt', 17, '2026-09-09 13:20:00', 1, NULL, NULL),
  (22, 5, 8, 3, '2026-10-26 13:00:00', '2026-10-26 14:00:00', 'Sprint-Review Softwareentwicklung', NULL, 0, NULL, 'geplant', 8, '2026-09-14 10:00:00', 1, NULL, NULL),
  (23, 2, 1, NULL, '2026-10-29 08:00:00', '2026-10-29 09:30:00', 'Geschäftsleitungsrunde', NULL, 0, NULL, 'geplant', 2, '2026-09-24 07:55:00', 1, NULL, NULL),
  (24, 2, 4, 4, '2026-11-06 08:00:00', '2026-11-06 10:00:00', 'Monatsabschluss Buchhaltung', NULL, 0, NULL, 'geplant', 4, '2026-09-02 08:30:00', 1, NULL, NULL);

COMMIT;
