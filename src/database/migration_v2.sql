-- =====================================================================
-- MIGRACIÓN v2 — Crono Sports
-- 1. Notificaciones email en inscripciones
-- 2. Tabla de categorías independiente
-- 3. Borrado lógico en carreras (valores 'eliminada' y 'archivada')
-- Ejecutar una sola vez sobre la base existente.
-- =====================================================================

-- ─── 1. NOTIFICACIONES EN INSCRIPCIONES ──────────────────────────────
ALTER TABLE inscripciones
  ADD COLUMN IF NOT EXISTS email_inscripcion_enviado  BOOLEAN   NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_inscripcion_fecha    TIMESTAMP,
  ADD COLUMN IF NOT EXISTS email_aprobacion_enviado   BOOLEAN   NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_aprobacion_fecha     TIMESTAMP;

-- ─── 2. TABLA DE CATEGORÍAS INDEPENDIENTE ────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  edad_minima INTEGER NOT NULL DEFAULT 0,
  edad_maxima INTEGER NOT NULL DEFAULT 120,
  sexo        sexo_enum NOT NULL DEFAULT 'otro',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_categorias_edades   CHECK (edad_minima <= edad_maxima),
  CONSTRAINT chk_categorias_edad_min CHECK (edad_minima >= 0)
);

CREATE INDEX IF NOT EXISTS idx_categorias_sexo   ON categorias (sexo);
CREATE INDEX IF NOT EXISTS idx_categorias_edades ON categorias (edad_minima, edad_maxima);

-- ─── 3. PIVOT carrera ↔ categoría ────────────────────────────────────
CREATE TABLE IF NOT EXISTS carrera_categorias (
  id_carrera   INTEGER NOT NULL REFERENCES carreras(id)   ON DELETE CASCADE,
  id_categoria INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  PRIMARY KEY (id_carrera, id_categoria)
);

-- ─── 4. NUEVOS VALORES EN ENUM estado_carrera ────────────────────────
ALTER TYPE estado_carrera ADD VALUE IF NOT EXISTS 'eliminada';
ALTER TYPE estado_carrera ADD VALUE IF NOT EXISTS 'archivada';

-- ─── 5. CATEGORÍAS ESTÁNDAR ──────────────────────────────────────────
INSERT INTO categorias (nombre, edad_minima, edad_maxima, sexo) VALUES
  ('Menores de 19 (M)',  0,  18, 'masculino'),
  ('20-24 (M)',         20,  24, 'masculino'),
  ('25-29 (M)',         25,  29, 'masculino'),
  ('30-34 (M)',         30,  34, 'masculino'),
  ('35-39 (M)',         35,  39, 'masculino'),
  ('40-44 (M)',         40,  44, 'masculino'),
  ('45-49 (M)',         45,  49, 'masculino'),
  ('50-54 (M)',         50,  54, 'masculino'),
  ('55-59 (M)',         55,  59, 'masculino'),
  ('60-64 (M)',         60,  64, 'masculino'),
  ('65-69 (M)',         65,  69, 'masculino'),
  ('70+ (M)',           70, 120, 'masculino'),
  ('Menores de 19 (F)',  0,  18, 'femenino'),
  ('20-24 (F)',         20,  24, 'femenino'),
  ('25-29 (F)',         25,  29, 'femenino'),
  ('30-34 (F)',         30,  34, 'femenino'),
  ('35-39 (F)',         35,  39, 'femenino'),
  ('40-44 (F)',         40,  44, 'femenino'),
  ('45-49 (F)',         45,  49, 'femenino'),
  ('50-54 (F)',         50,  54, 'femenino'),
  ('55-59 (F)',         55,  59, 'femenino'),
  ('60-64 (F)',         60,  64, 'femenino'),
  ('65-69 (F)',         65,  69, 'femenino'),
  ('70+ (F)',           70, 120, 'femenino')
ON CONFLICT DO NOTHING;
