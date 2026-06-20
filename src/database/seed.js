/**
 * Script de seed.
 * Crea datos de ejemplo: administradores, carreras, modalidades e inscripciones.
 *
 * Uso:
 *   node src/database/seed.js
 *
 * Requiere que las tablas ya existan (ejecutar antes schema.sql).
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../config/db');

async function seed() {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    console.log('Creando administradores...');
    const passwordHash = await bcrypt.hash('Admin123!', 10);

    await client.query(
      `INSERT INTO admins (nombre, email, password_hash, rol)
       VALUES
        ($1, $2, $3, 'super_admin'),
        ($4, $5, $3, 'organizador')
       ON CONFLICT (email) DO NOTHING`,
      [
        'Administrador Principal',
        'admin@runevent.com',
        passwordHash,
        'Organizador Norte',
        'organizador@runevent.com'
      ]
    );

    console.log('Creando carreras...');
    const carrerasResult = await client.query(
      `INSERT INTO carreras (nombre, tipo, fecha_evento, ubicacion, descripcion, cupo_maximo, precio_base, estado, imagen_portada_url)
       VALUES
        ('Maraton de la Ciudad 2026', 'running', '2026-09-20', 'Santiago del Estero, AR', 'Carrera urbana de 10K y 21K por el centro historico.', 1000, 5000.00, 'activa', 'https://example.com/img/maraton2026.jpg'),
        ('Duatlon del Rio', 'duatlon', '2026-10-12', 'La Banda, Santiago del Estero, AR', 'Combinacion de ciclismo y running junto al rio Dulce.', 300, 8000.00, 'activa', 'https://example.com/img/duatlon-rio.jpg'),
        ('Gran Fondo Ciclistico', 'ciclismo', '2026-11-08', 'Termas de Rio Hondo, AR', 'Recorrido de 60K y 100K en ruta.', 500, 7000.00, 'activa', 'https://example.com/img/granfondo.jpg')
       RETURNING id, nombre`
    );

    const [maraton, duatlon, granFondo] = carrerasResult.rows;
    console.log('Carreras creadas:', carrerasResult.rows.map((c) => c.nombre).join(', '));

    console.log('Creando modalidades...');
    const modalidadesResult = await client.query(
      `INSERT INTO modalidades (id_carrera, nombre, distancia, sexo, edad_minima, edad_maxima, precio_extra)
       VALUES
        ($1, '10K Libre', '10K', 'otro', 16, 120, 0),
        ($1, '21K Libre', '21K', 'otro', 18, 120, 1500),
        ($1, '10K Master Femenino', '10K', 'femenino', 35, 120, 0),
        ($1, '10K Master Masculino', '10K', 'masculino', 35, 120, 0),
        ($2, 'Sprint Mixto', 'Bici 20K + Pedestre 5K', 'otro', 18, 120, 0),
        ($2, 'Sprint Femenino', 'Bici 20K + Pedestre 5K', 'femenino', 18, 120, 0),
        ($3, '60K General', '60K', 'otro', 16, 120, 0),
        ($3, '100K Elite', '100K', 'otro', 18, 120, 1000)
       RETURNING id, id_carrera, nombre, sexo, edad_minima, edad_maxima`,
      [maraton.id, duatlon.id, granFondo.id]
    );

    console.log(`Modalidades creadas: ${modalidadesResult.rows.length}`);

    // Mapeo de modalidades por nombre para usarlas en las inscripciones de ejemplo
    const modalidadPorNombre = {};
    modalidadesResult.rows.forEach((m) => {
      modalidadPorNombre[m.nombre] = m;
    });

    console.log('Creando inscripciones de ejemplo...');
    const modalidad10kLibre = modalidadPorNombre['10K Libre'];
    const modalidad21kLibre = modalidadPorNombre['21K Libre'];
    const modalidad10kMasterFem = modalidadPorNombre['10K Master Femenino'];
    const modalidadSprintMixto = modalidadPorNombre['Sprint Mixto'];
    const modalidad100kElite = modalidadPorNombre['100K Elite'];

    await client.query(
      `INSERT INTO inscripciones
        (id_carrera, id_modalidad, nombre_completo, dni, fecha_nacimiento, sexo, ciudad, edad, categoria, comprobante, estado_pago)
       VALUES
        ($1, $2, 'Juan Carlos Perez', '30123456', '1995-03-14', 'masculino', 'La Banda', 31, $3, NULL, 'Aprobado'),
        ($1, $4, 'Maria Fernanda Gomez', '32456789', '1992-07-22', 'femenino', 'Santiago del Estero', 33, $5, NULL, 'Pendiente'),
        ($1, $6, 'Laura Beatriz Sosa', '25789123', '1985-01-10', 'femenino', 'La Banda', 41, $7, NULL, 'Pendiente'),
        ($8, $9, 'Diego Alejandro Ruiz', '33987654', '1990-11-05', 'masculino', 'Termas de Rio Hondo', 35, $10, NULL, 'Rechazado'),
        ($11, $12, 'Carlos Andres Medina', '28654321', '1988-06-30', 'masculino', 'Santiago del Estero', 37, $13, NULL, 'Aprobado')
       ON CONFLICT (dni, id_carrera) DO NOTHING`,
      [
        maraton.id,
        modalidad10kLibre.id,
        modalidad10kLibre.nombre,
        modalidad21kLibre.id,
        modalidad21kLibre.nombre,
        modalidad10kMasterFem.id,
        modalidad10kMasterFem.nombre,
        duatlon.id,
        modalidadSprintMixto.id,
        modalidadSprintMixto.nombre,
        granFondo.id,
        modalidad100kElite.id,
        modalidad100kElite.nombre
      ]
    );

    await client.query('COMMIT');

    console.log('\nSeed completado correctamente.');
    console.log('Credenciales de acceso de ejemplo:');
    console.log('  Email: admin@runevent.com');
    console.log('  Password: Admin123!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al ejecutar el seed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.pool.end();
  }
}

seed();
