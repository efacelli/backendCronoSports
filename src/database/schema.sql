-- =====================================================================
-- PLATAFORMA DE INSCRIPCIONES - SCHEMA POSTGRESQL
-- Ejecutar este script en una base de datos vacia antes de iniciar
-- el backend (o usar database.sql equivalente entregado previamente).
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE rol_admin AS ENUM ('super_admin', 'organizador');
CREATE TYPE tipo_carrera AS ENUM ('running', 'duatlon', 'ciclismo');
CREATE TYPE estado_carrera AS ENUM ('activa', 'cerrada', 'finalizada');
CREATE TYPE sexo_enum AS ENUM ('masculino', 'femenino', 'otro');
CREATE TYPE estado_pago_enum AS ENUM ('Pendiente', 'Aprobado', 'Rechazado');

CREATE TABLE admins (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    rol             rol_admin NOT NULL DEFAULT 'organizador',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_admins_email UNIQUE (email),
    CONSTRAINT chk_admins_email_formato CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_admins_email ON admins (email);

CREATE TABLE carreras (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(150) NOT NULL,
    tipo                tipo_carrera NOT NULL,
    fecha_evento        DATE NOT NULL,
    ubicacion           VARCHAR(200),
    descripcion         TEXT,
    cupo_maximo         INTEGER NOT NULL DEFAULT 0,
    precio_base         NUMERIC(10,2) NOT NULL DEFAULT 0,
    estado              estado_carrera NOT NULL DEFAULT 'activa',
    imagen_portada_url  VARCHAR(500),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_carreras_cupo_positivo CHECK (cupo_maximo >= 0),
    CONSTRAINT chk_carreras_precio_positivo CHECK (precio_base >= 0)
);

CREATE INDEX idx_carreras_tipo ON carreras (tipo);
CREATE INDEX idx_carreras_estado ON carreras (estado);
CREATE INDEX idx_carreras_fecha_evento ON carreras (fecha_evento);

CREATE TABLE modalidades (
    id              SERIAL PRIMARY KEY,
    id_carrera      INTEGER NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    distancia       VARCHAR(50),
    sexo            sexo_enum NOT NULL DEFAULT 'otro',
    edad_minima     INTEGER NOT NULL DEFAULT 0,
    edad_maxima     INTEGER NOT NULL DEFAULT 120,
    precio_extra    NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_modalidades_carrera
        FOREIGN KEY (id_carrera) REFERENCES carreras (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_modalidades_edades CHECK (edad_minima <= edad_maxima),
    CONSTRAINT chk_modalidades_edad_positiva CHECK (edad_minima >= 0),
    CONSTRAINT chk_modalidades_precio_extra CHECK (precio_extra >= 0),
    CONSTRAINT uq_modalidades_carrera_nombre UNIQUE (id_carrera, nombre)
);

CREATE INDEX idx_modalidades_carrera ON modalidades (id_carrera);
CREATE INDEX idx_modalidades_rango_edad ON modalidades (edad_minima, edad_maxima);

CREATE TABLE inscripciones (
    id                  SERIAL PRIMARY KEY,
    id_carrera          INTEGER NOT NULL,
    id_modalidad        INTEGER NOT NULL,
    nombre_completo     VARCHAR(150) NOT NULL,
    dni                 VARCHAR(20) NOT NULL,
    fecha_nacimiento    DATE NOT NULL,
    sexo                sexo_enum NOT NULL,
    ciudad              VARCHAR(100),
    edad                INTEGER NOT NULL,
    categoria           VARCHAR(100) NOT NULL,
    comprobante         VARCHAR(500),
    estado_pago         estado_pago_enum NOT NULL DEFAULT 'Pendiente',
    fecha_inscripcion   TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_inscripciones_carrera
        FOREIGN KEY (id_carrera) REFERENCES carreras (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_inscripciones_modalidad
        FOREIGN KEY (id_modalidad) REFERENCES modalidades (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_inscripciones_edad_positiva CHECK (edad >= 0),
    CONSTRAINT chk_inscripciones_dni_formato CHECK (dni ~ '^[0-9A-Za-z.-]{5,20}$'),
    CONSTRAINT chk_inscripciones_fecha_nacimiento CHECK (fecha_nacimiento <= CURRENT_DATE),

    CONSTRAINT uq_inscripciones_dni_carrera UNIQUE (dni, id_carrera)
);

CREATE INDEX idx_inscripciones_carrera ON inscripciones (id_carrera);
CREATE INDEX idx_inscripciones_modalidad ON inscripciones (id_modalidad);
CREATE INDEX idx_inscripciones_dni ON inscripciones (dni);
CREATE INDEX idx_inscripciones_estado_pago ON inscripciones (estado_pago);
CREATE INDEX idx_inscripciones_fecha_inscripcion ON inscripciones (fecha_inscripcion);
CREATE INDEX idx_inscripciones_categoria ON inscripciones (categoria);
