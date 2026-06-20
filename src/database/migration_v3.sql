-- Migración v3
ALTER TYPE tipo_carrera ADD VALUE IF NOT EXISTS 'triatlon';

ALTER TABLE inscripciones
  ADD COLUMN IF NOT EXISTS observaciones TEXT;
