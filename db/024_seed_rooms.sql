-- =====================================================================
-- Generiert Testdaten für rooms
-- =====================================================================

SET NAMES utf8mb4;
USE raumbuchung;

START TRANSACTION;

INSERT INTO rooms (name, building, floor, capacity, description, is_active) VALUES
  ('A_01', 'Gebäude A', 'EG', 12, 'Mittelgroßer Besprechungsraum nahe dem Empfang, geeignet für Kundentermine.', 1),
  ('A_02', 'Gebäude A', 'EG', 20, 'Großer Konferenzraum für Präsentationen und hybride Meetings.', 1),
  ('A_03', 'Gebäude A', '1. OG', 6, 'Kleiner Besprechungsraum mit Bildschirm für Team-Abstimmungen.', 1),
  ('B_01', 'Gebäude B', '1. OG', 8, 'Kreativraum mit Whiteboard-Wand für Workshops.', 1),
  ('B_02', 'Gebäude B', '2. OG', 10, 'Videokonferenzraum für Termine mit Kunden und Partnern.', 1),
  ('B_03', 'Gebäude B', '2. OG', 4, 'Fokusraum für kurze Abstimmungen und vertrauliche Gespräche.', 1),
  ('C_01', 'Gebäude C', 'EG', 60, 'Veranstaltungsraum für Schulungen und Betriebsversammlungen, bei Bedarf teilbar.', 1),
  ('C_02', 'Gebäude C', '1. OG', 8, 'Besprechungsraum, derzeit wegen Umbau gesperrt.', 0);

COMMIT;
