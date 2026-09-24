-- =====================================================================
-- Generiert Testdaten für users
-- =====================================================================

SET NAMES utf8mb4;
USE raumbuchung;

START TRANSACTION;

INSERT INTO users (department_id, role_id, email, password_hash, first_name, last_name, failed_login_count, locked_until, is_active) VALUES
  (1, 2, 'anke.lorenz@firma.de', '$2b$12$Wa15WzieqJl4GAHTNL/uHOVi.4cmGv9aSclQ2txh0h8Ehfo/PsT72', 'Anke', 'Lorenz', 0, NULL, 1),
  (2, 2, 'tom.reuter@firma.de', '$2b$12$um8ecCcUrnX5Fnfh17AOD.6VqejlxuhpJCQ9v15LjY6kcZ.d0QsHW', 'Tom', 'Reuter', 0, NULL, 1),
  (2, 1, 'katharina.boehm@firma.de', '$2b$12$l8zdOoJ.ajhThAllHZt2dOuk1zjtVPeIY4iyNsS99SLuVGSGBYyPq', 'Katharina', 'Böhm', 0, NULL, 1),
  (3, 1, 'harald.weizmann@firma.de', '$2b$12$msVIISo7QXctfQpdbbtcWOMWPxflv2ttxTqd7euTW4Hn38iUURAnO', 'Harald', 'Weizmann', 1, NULL, 1),
  (3, 1, 'claudia.meyer@firma.de', '$2b$12$uqjlE3RqP37gZKV9OEkfDeecBeNFdHYW/P6ralxLbjmfscOq3bCtO', 'Claudia', 'Meyer', 0, NULL, 1),
  (4, 2, 'felix.brandt@firma.de', '$2b$12$zu7GmW3.2wu4TsJb8DdneOMEWH4m/TNu7jNqLic3wkbAIUewWWYR2', 'Felix', 'Brandt', 0, NULL, 1),
  (4, 1, 'jonas.pfeiffer@firma.de', '$2b$12$mrBLFZV2MhsbouGAKahLUO0JdGndJfO0eJxoDQbEMzMF6HgWZyjOa', 'Jonas', 'Pfeiffer', 0, NULL, 0),
  (5, 1, 'sophie.krueger@firma.de', '$2b$12$Id4Obvv4niyEy/BNqBZwC.OFbxEUBm24tZEG97LulqNGWakyxYoWm', 'Sophie', 'Krüger', 0, NULL, 1),
  (5, 1, 'niklas.schaefer@firma.de', '$2b$12$CaLyGYlfYMqzYEKuDkou0OsqE1PirOv2yopiPUdD6xWMAXP6LVC5q', 'Niklas', 'Schäfer', 3, NULL, 1),
  (5, 1, 'emre.oeztuerk@firma.de', '$2b$12$nDW.WvZZYv3qB1JOlCbzxu7YkEZUbnfgqZ6MKswvGFAofEhqGJ06m', 'Emre', 'Öztürk', 0, NULL, 1),
  (6, 1, 'petra.schulte@firma.de', '$2b$12$mUBLWxkxSUMVSsrn4c/YouEk227j8sf90uotI9qwjhNlGWQdX7oTy', 'Petra', 'Schulte', 0, NULL, 1),
  (6, 1, 'janerik.hansen@firma.de', '$2b$12$G.D4MbmuIevPX5947SLwEeNbWBDDKU4mRH0ZBbBZnXLTHNAngCuKm', 'Jan-Erik', 'Hansen', 0, NULL, 1),
  (7, 1, 'murat.demir@firma.de', '$2b$12$IQ9G7ZVC8pnJD348iitBHea5dlBXujpir.YZRyG6W9KnuQO9pCnRy', 'Murat', 'Demir', 0, NULL, 1),
  (8, 1, 'sabine.kern@firma.de', '$2b$12$LXnB5LqcaS/MDRHHgKwONuwtrxtz24iq.PhghJoclp8LUEvYFY33W', 'Sabine', 'Kern', 0, NULL, 0),
  (8, 1, 'daniel.voss@firma.de', '$2b$12$HwFeegYgw1ycS5RV1ELUf.uttLObo1qpqWSu3V5.cCgPDjYpf6dIe', 'Daniel', 'Voss', 2, NULL, 1),
  (8, 1, 'julia.weiss@firma.de', '$2b$12$bSrDrh5axegEc3O1CjJIjeADhNg819MB7RIf7ovW9tRwjk6Yv6pES', 'Julia', 'Weiß', 0, NULL, 1),
  (9, 1, 'lena.hofmann@firma.de', '$2b$12$kQXyuPfHyfAnGjZOEI22B.bV2lXEgHeWzaHofVU1TaXFHH0DjcxqG', 'Lena', 'Hofmann', 0, NULL, 1),
  (9, 1, 'can.yilmaz@firma.de', '$2b$12$LVxpjl4pSFPlOsAhca1D4ObQgkCdldtQq3rPlEzKbS0WVHTj31BWa', 'Can', 'Yilmaz', 0, NULL, 1);

COMMIT;
