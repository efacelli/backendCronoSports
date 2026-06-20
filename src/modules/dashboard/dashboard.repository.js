const db = require('../../config/db');

/**
 * Resumen general de la plataforma.
 */
async function getResumenGeneral() {
  const result = await db.query(`
    SELECT
      (SELECT COUNT(*)::int FROM carreras) AS total_carreras,
      (SELECT COUNT(*)::int FROM carreras WHERE estado = 'activa') AS carreras_activas,
      (SELECT COUNT(*)::int FROM inscripciones) AS total_inscripciones,
      (SELECT COUNT(*)::int FROM inscripciones WHERE estado_pago = 'Pendiente') AS pagos_pendientes,
      (SELECT COUNT(*)::int FROM inscripciones WHERE estado_pago = 'Aprobado') AS pagos_aprobados,
      (SELECT COUNT(*)::int FROM inscripciones WHERE estado_pago = 'Rechazado') AS pagos_rechazados
  `);

  return result.rows[0];
}

/**
 * Cantidad de inscripciones por carrera, con estado de pago desglosado.
 */
async function getInscripcionesPorCarrera() {
  const result = await db.query(`
    SELECT
      c.id AS id_carrera,
      c.nombre AS carrera_nombre,
      c.tipo AS carrera_tipo,
      c.fecha_evento,
      c.cupo_maximo,
      COUNT(i.id)::int AS total_inscripciones,
      COUNT(i.id) FILTER (WHERE i.estado_pago = 'Pendiente')::int AS pendientes,
      COUNT(i.id) FILTER (WHERE i.estado_pago = 'Aprobado')::int AS aprobadas,
      COUNT(i.id) FILTER (WHERE i.estado_pago = 'Rechazado')::int AS rechazadas
    FROM carreras c
    LEFT JOIN inscripciones i ON i.id_carrera = c.id
    GROUP BY c.id, c.nombre, c.tipo, c.fecha_evento, c.cupo_maximo
    ORDER BY c.fecha_evento ASC
  `);

  return result.rows;
}

/**
 * Cantidad de inscripciones agrupadas por fecha (dia) de inscripcion.
 * Util para graficos de evolucion temporal.
 */
async function getInscripcionesPorFecha() {
  const result = await db.query(`
    SELECT
      DATE(fecha_inscripcion) AS fecha,
      COUNT(*)::int AS total
    FROM inscripciones
    GROUP BY DATE(fecha_inscripcion)
    ORDER BY fecha ASC
  `);

  return result.rows;
}

/**
 * Distribucion de inscripciones por categoria/modalidad.
 */
async function getInscripcionesPorCategoria() {
  const result = await db.query(`
    SELECT
      categoria,
      COUNT(*)::int AS total
    FROM inscripciones
    GROUP BY categoria
    ORDER BY total DESC
  `);

  return result.rows;
}

/**
 * Distribucion de inscripciones por sexo.
 */
async function getInscripcionesPorSexo() {
  const result = await db.query(`
    SELECT
      sexo,
      COUNT(*)::int AS total
    FROM inscripciones
    GROUP BY sexo
    ORDER BY total DESC
  `);

  return result.rows;
}

/**
 * Distribucion de inscripciones por modalidad (nombre de modalidad).
 */
async function getInscripcionesPorModalidad() {
  const result = await db.query(`
    SELECT
      m.nombre AS modalidad,
      m.distancia,
      c.nombre AS carrera_nombre,
      COUNT(i.id)::int AS total,
      COUNT(i.id) FILTER (WHERE i.estado_pago = 'Aprobado')::int AS aprobadas,
      COUNT(i.id) FILTER (WHERE i.estado_pago = 'Pendiente')::int AS pendientes,
      COUNT(i.id) FILTER (WHERE i.estado_pago = 'Rechazado')::int AS rechazadas
    FROM modalidades m
    JOIN carreras c ON c.id = m.id_carrera
    LEFT JOIN inscripciones i ON i.id_modalidad = m.id
    GROUP BY m.id, m.nombre, m.distancia, c.nombre
    ORDER BY total DESC
  `);

  return result.rows;
}

/**
 * Evolucion de inscripciones por dia (ultimos 30 dias).
 */
async function getEvolucionInscripciones() {
  const result = await db.query(`
    SELECT
      DATE(fecha_inscripcion) AS fecha,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE estado_pago = 'Aprobado')::int AS aprobadas,
      COUNT(*) FILTER (WHERE estado_pago = 'Pendiente')::int AS pendientes
    FROM inscripciones
    WHERE fecha_inscripcion >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(fecha_inscripcion)
    ORDER BY fecha ASC
  `);

  return result.rows;
}

module.exports = {
  getResumenGeneral,
  getInscripcionesPorCarrera,
  getInscripcionesPorFecha,
  getInscripcionesPorCategoria,
  getInscripcionesPorSexo,
  getInscripcionesPorModalidad,
  getEvolucionInscripciones
};
