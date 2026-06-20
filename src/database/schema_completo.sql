-- =====================================================================
-- CRONO SPORTS — Schema PostgreSQL completo y actualizado
-- Versión final consolidada (incluye migration_v1 + migration_v2)
-- Ejecutar sobre una base de datos vacía.
-- =====================================================================

-- ─── EXTENSIONES ─────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── TIPOS ENUM ──────────────────────────────────────────────────────
CREATE TYPE rol_admin      AS ENUM ('super_admin', 'organizador');
CREATE TYPE tipo_carrera   AS ENUM ('running', 'duatlon', 'ciclismo');
CREATE TYPE estado_carrera AS ENUM ('activa', 'cerrada', 'finalizada', 'archivada', 'eliminada');
CREATE TYPE sexo_enum      AS ENUM ('masculino', 'femenino', 'otro');
CREATE TYPE estado_pago_enum AS ENUM ('Pendiente', 'Aprobado', 'Rechazado');

-- =====================================================================
-- TABLA: admins
-- =====================================================================
CREATE TABLE admins (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    rol           rol_admin     NOT NULL DEFAULT 'organizador',
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_admins_email        UNIQUE (email),
    CONSTRAINT chk_admins_email_fmt   CHECK  (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_admins_email ON admins (email);

-- =====================================================================
-- TABLA: carreras
-- =====================================================================
CREATE TABLE carreras (
    id                   SERIAL          PRIMARY KEY,
    nombre               VARCHAR(150)    NOT NULL,
    tipo                 tipo_carrera    NOT NULL,
    fecha_evento         DATE            NOT NULL,
    ubicacion            VARCHAR(200),
    descripcion          TEXT,
    cupo_maximo          INTEGER         NOT NULL DEFAULT 0,
    precio_base          NUMERIC(10,2)   NOT NULL DEFAULT 0,
    estado               estado_carrera  NOT NULL DEFAULT 'activa',
    imagen_portada_url   VARCHAR(500),
    -- Datos de pago
    alias                VARCHAR(100),
    cbu                  VARCHAR(22),
    whatsapp             VARCHAR(30),
    -- Multimedia y mapa
    url_mapa             VARCHAR(500),
    imagen_recorrido_url VARCHAR(500),

    created_at           TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_carreras_cupo    CHECK (cupo_maximo >= 0),
    CONSTRAINT chk_carreras_precio  CHECK (precio_base >= 0)
);

CREATE INDEX idx_carreras_tipo        ON carreras (tipo);
CREATE INDEX idx_carreras_estado      ON carreras (estado);
CREATE INDEX idx_carreras_fecha       ON carreras (fecha_evento);

-- =====================================================================
-- TABLA: modalidades
-- Categorías de competencia dentro de una carrera
-- (distancia, sexo, rango etario)
-- =====================================================================
CREATE TABLE modalidades (
    id          SERIAL       PRIMARY KEY,
    id_carrera  INTEGER      NOT NULL,
    nombre      VARCHAR(100) NOT NULL,
    distancia   VARCHAR(50),
    sexo        sexo_enum    NOT NULL DEFAULT 'otro',
    edad_minima INTEGER      NOT NULL DEFAULT 0,
    edad_maxima INTEGER      NOT NULL DEFAULT 120,
    precio_extra NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_modalidades_carrera
        FOREIGN KEY (id_carrera) REFERENCES carreras (id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT chk_modalidades_edades   CHECK (edad_minima <= edad_maxima),
    CONSTRAINT chk_modalidades_edad_min CHECK (edad_minima >= 0),
    CONSTRAINT chk_modalidades_precio   CHECK (precio_extra >= 0),
    CONSTRAINT uq_modalidades_nombre    UNIQUE (id_carrera, nombre)
);

CREATE INDEX idx_modalidades_carrera   ON modalidades (id_carrera);
CREATE INDEX idx_modalidades_edades    ON modalidades (edad_minima, edad_maxima);

-- =====================================================================
-- TABLA: categorias
-- Rangos etarios independientes (se asocian a carreras via pivot)
-- =====================================================================
CREATE TABLE categorias (
    id          SERIAL       PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    edad_minima INTEGER      NOT NULL DEFAULT 0,
    edad_maxima INTEGER      NOT NULL DEFAULT 120,
    sexo        sexo_enum    NOT NULL DEFAULT 'otro',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_categorias_edades   CHECK (edad_minima <= edad_maxima),
    CONSTRAINT chk_categorias_edad_min CHECK (edad_minima >= 0)
);

CREATE INDEX idx_categorias_sexo   ON categorias (sexo);
CREATE INDEX idx_categorias_edades ON categorias (edad_minima, edad_maxima);

-- =====================================================================
-- TABLA PIVOT: carrera ↔ categoría
-- =====================================================================
CREATE TABLE carrera_categorias (
    id_carrera   INTEGER NOT NULL REFERENCES carreras   (id) ON DELETE CASCADE,
    id_categoria INTEGER NOT NULL REFERENCES categorias (id) ON DELETE CASCADE,
    PRIMARY KEY (id_carrera, id_categoria)
);

-- =====================================================================
-- TABLA: inscripciones
-- =====================================================================
CREATE TABLE inscripciones (
    id              SERIAL           PRIMARY KEY,
    id_carrera      INTEGER          NOT NULL,
    id_modalidad    INTEGER          NOT NULL,

    -- Datos personales
    apellido        VARCHAR(100),
    nombre          VARCHAR(100),
    nombre_completo VARCHAR(150)     NOT NULL,   -- "Apellido, Nombre" generado
    dni             VARCHAR(20)      NOT NULL,
    fecha_nacimiento DATE            NOT NULL,
    sexo            sexo_enum        NOT NULL,
    email           VARCHAR(150),
    telefono        VARCHAR(30),
    ciudad          VARCHAR(100),

    -- Datos calculados
    edad            INTEGER          NOT NULL,
    categoria       VARCHAR(100)     NOT NULL,

    -- Pago
    comprobante     VARCHAR(500),
    estado_pago     estado_pago_enum NOT NULL DEFAULT 'Pendiente',

    -- Notificaciones email
    email_inscripcion_enviado  BOOLEAN   NOT NULL DEFAULT FALSE,
    email_inscripcion_fecha    TIMESTAMP,
    email_aprobacion_enviado   BOOLEAN   NOT NULL DEFAULT FALSE,
    email_aprobacion_fecha     TIMESTAMP,

    fecha_inscripcion TIMESTAMP     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_inscripciones_carrera
        FOREIGN KEY (id_carrera)   REFERENCES carreras   (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_inscripciones_modalidad
        FOREIGN KEY (id_modalidad) REFERENCES modalidades (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_inscripciones_edad      CHECK (edad >= 0),
    CONSTRAINT chk_inscripciones_dni_fmt   CHECK (dni ~ '^[0-9A-Za-z.-]{5,20}$'),
    CONSTRAINT chk_inscripciones_fnac      CHECK (fecha_nacimiento <= CURRENT_DATE),

    -- Evita doble inscripción del mismo DNI en la misma carrera
    CONSTRAINT uq_inscripciones_dni_carrera UNIQUE (dni, id_carrera)
);

CREATE INDEX idx_inscripciones_carrera    ON inscripciones (id_carrera);
CREATE INDEX idx_inscripciones_modalidad  ON inscripciones (id_modalidad);
CREATE INDEX idx_inscripciones_dni        ON inscripciones (dni);
CREATE INDEX idx_inscripciones_estado     ON inscripciones (estado_pago);
CREATE INDEX idx_inscripciones_fecha      ON inscripciones (fecha_inscripcion);
CREATE INDEX idx_inscripciones_categoria  ON inscripciones (categoria);
CREATE INDEX idx_inscripciones_email      ON inscripciones (email);

-- =====================================================================
-- TABLA: patrocinadores (carrusel home)
-- =====================================================================
CREATE TABLE patrocinadores (
    id                   SERIAL       PRIMARY KEY,
    nombre               VARCHAR(100) NOT NULL,
    logo_url             VARCHAR(500),
    sitio_web            VARCHAR(500),
    orden_visualizacion  INTEGER      NOT NULL DEFAULT 0,
    activo               BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- DATOS DE EJEMPLO
-- =====================================================================

-- Admin por defecto (password: Admin123! — bcrypt generado por seed.js)
INSERT INTO admins (nombre, email, password_hash, rol) VALUES
  ('Administrador Principal', 'admin@cronosports.com.ar',
   '$2b$10$N9qo8uLOickgx2ZMRZoMy.MyrLqHHvDoZHkbqMFR3sJ0J5jJlqXve',
   'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Carrera de ejemplo
INSERT INTO carreras
  (nombre, tipo, fecha_evento, ubicacion, descripcion, cupo_maximo, precio_base,
   estado, alias, cbu, whatsapp)
VALUES
  ('Maratón de la Ciudad 2026', 'running', '2026-09-20',
   'Santiago del Estero, AR',
   'Carrera urbana de 10K y 21K por el centro histórico.',
   1000, 5000.00, 'activa',
   'cronosports.sde', '0000000000000000000000', '5493856000000')
ON CONFLICT DO NOTHING;

-- Categorías estándar
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
