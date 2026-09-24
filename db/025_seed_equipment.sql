-- =====================================================================
-- Generiert Testdaten für equipment
-- =====================================================================

SET NAMES utf8mb4;
USE raumbuchung;

START TRANSACTION;

INSERT INTO equipment (name, is_active) VALUES
  ('Beamer', 1),
  ('Whiteboard', 1),
  ('Bildschirm', 1),
  ('Kamera', 1),
  ('Telefon', 1),
  ('Flipchart', 1),
  ('Pinnwand', 1),
  ('Schreibmaterial', 1),
  ('Klimaanlage', 1),
  ('Overheadprojektor', 0);

COMMIT;
