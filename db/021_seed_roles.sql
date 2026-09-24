-- =====================================================================
-- Generiert Testdaten für roles
-- =====================================================================

SET NAMES utf8mb4;
USE raumbuchung;

START TRANSACTION;

INSERT INTO roles (name, is_active) VALUES
  ('User', 1),
  ('Admin', 1);

COMMIT;
