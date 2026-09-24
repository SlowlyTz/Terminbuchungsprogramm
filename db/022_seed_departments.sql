-- =====================================================================
-- Generiert Testdaten für departments
-- =====================================================================

SET NAMES utf8mb4;
USE raumbuchung;

START TRANSACTION;

INSERT INTO departments (name, is_active) VALUES
  ('Geschäftsleitung', 1),
  ('Personal', 1),
  ('Buchhaltung', 1),
  ('IT', 1),
  ('Softwareentwicklung', 1),
  ('Projektmanagement', 1),
  ('Einkauf', 1),
  ('Vertrieb', 1),
  ('Marketing', 1);

COMMIT;
