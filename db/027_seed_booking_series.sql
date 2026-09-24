-- =====================================================================
-- Generiert Testdaten für booking_series
-- =====================================================================

SET NAMES utf8mb4;
USE raumbuchung;

START TRANSACTION;

INSERT INTO booking_series (frequency, interval_value, until_date, is_active) VALUES
  ('täglich', 1, '2026-10-09', 1),
  ('wöchentlich', 1, '2027-03-25', 1),
  ('wöchentlich', 2, '2026-12-21', 1),
  ('monatlich', 1, '2027-06-30', 1),
  ('monatlich', 3, '2027-12-31', 1);

COMMIT;
