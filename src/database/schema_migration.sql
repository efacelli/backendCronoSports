-- =====================================================================
-- MIGRACIÓN: Crono Sports — campos nuevos en carreras e inscripciones
-- Ejecutar una sola vez sobre la base de datos existente.
-- =====================================================================

-- 1. Nuevos campos en la tabla "carreras"
ALTER TABLE carreras
  ADD COLUMN IF NOT EXISTS alias             VARCHAR(100),
  ADD COLUMN IF NOT EXISTS cbu               VARCHAR(22),
  ADD COLUMN IF NOT EXISTS whatsapp          VARCHAR(30),
  ADD COLUMN IF NOT EXISTS url_mapa          VARCHAR(500),
  ADD COLUMN IF NOT EXISTS imagen_recorrido_url VARCHAR(500);

-- 2. Separar apellido / nombre en "inscripciones"
--    Se agrega apellido como columna nueva.
--    nombre_completo se conserva para compatibilidad.
ALTER TABLE inscripciones
  ADD COLUMN IF NOT EXISTS apellido  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS nombre    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS email     VARCHAR(150),
  ADD COLUMN IF NOT EXISTS telefono  VARCHAR(30);

-- 3. Índice en email de inscripciones (búsquedas frecuentes)
CREATE INDEX IF NOT EXISTS idx_inscripciones_email ON inscripciones (email);

-- 4. Actualizar datos de ejemplo con los nuevos campos
UPDATE carreras SET
  alias    = 'circuito.sur',
  cbu      = '0000000000000000000000',
  whatsapp = '5493856000000'
WHERE alias IS NULL;
