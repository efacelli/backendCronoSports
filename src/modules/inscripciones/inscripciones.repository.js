const db = require('../../config/db');

async function findAll(filtros = {}) {
  const condiciones = [];
  const valores = [];

  if (filtros.id_carrera) {
    valores.push(filtros.id_carrera);
    condiciones.push(`i.id_carrera = $${valores.length}`);
  }
  if (filtros.estado_pago) {
    valores.push(filtros.estado_pago);
    condiciones.push(`i.estado_pago = $${valores.length}`);
  }
  if (filtros.dni) {
    valores.push(filtros.dni);
    condiciones.push(`i.dni = $${valores.length}`);
  }

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const result = await db.query(
    `SELECT
        i.id, i.id_carrera, i.id_modalidad,
        i.apellido, i.nombre, i.nombre_completo,
        i.dni, i.fecha_nacimiento, i.sexo,
        i.email, i.telefono, i.ciudad,
        i.edad, i.categoria,
        i.comprobante, i.estado_pago, i.observaciones, i.fecha_inscripcion,
        c.nombre AS carrera_nombre, c.tipo AS carrera_tipo, c.fecha_evento,
        m.nombre AS modalidad_nombre, m.distancia AS modalidad_distancia
     FROM inscripciones i
     JOIN carreras c ON c.id = i.id_carrera
     JOIN modalidades m ON m.id = i.id_modalidad
     ${where}
     ORDER BY i.fecha_inscripcion DESC`,
    valores
  );
  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    `SELECT
        i.id, i.id_carrera, i.id_modalidad,
        i.apellido, i.nombre, i.nombre_completo,
        i.dni, i.fecha_nacimiento, i.sexo,
        i.email, i.telefono, i.ciudad,
        i.edad, i.categoria,
        i.comprobante, i.estado_pago, i.observaciones, i.fecha_inscripcion,
        c.nombre AS carrera_nombre, c.tipo AS carrera_tipo, c.fecha_evento, c.precio_base,
        m.nombre AS modalidad_nombre, m.distancia AS modalidad_distancia, m.precio_extra
     FROM inscripciones i
     JOIN carreras c ON c.id = i.id_carrera
     JOIN modalidades m ON m.id = i.id_modalidad
     WHERE i.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function existeInscripcion(dni, idCarrera) {
  const result = await db.query(
    'SELECT id FROM inscripciones WHERE dni = $1 AND id_carrera = $2',
    [dni, idCarrera]
  );
  return result.rows.length > 0;
}

async function create(data) {
  const {
    id_carrera, id_modalidad,
    apellido, nombre, nombre_completo,
    dni, fecha_nacimiento, sexo,
    email, telefono, ciudad,
    edad, categoria, comprobante, estado_pago
  } = data;

  const result = await db.query(
    `INSERT INTO inscripciones
       (id_carrera, id_modalidad, apellido, nombre, nombre_completo,
        dni, fecha_nacimiento, sexo, email, telefono, ciudad,
        edad, categoria, comprobante, estado_pago, observaciones)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING id, id_carrera, id_modalidad, apellido, nombre, nombre_completo,
               dni, fecha_nacimiento, sexo, email, telefono, ciudad,
               edad, categoria, comprobante, estado_pago, fecha_inscripcion`,
    [
      id_carrera, id_modalidad,
      apellido || null, nombre || null,
      nombre_completo || `${apellido || ''} ${nombre || ''}`.trim(),
      dni, fecha_nacimiento, sexo,
      email || null, telefono || null, ciudad || null,
      edad, categoria,
      comprobante || null, estado_pago || 'Pendiente',
      data.observaciones || null
    ]
  );
  return result.rows[0];
}

async function actualizarComprobante(id, comprobante) {
  const result = await db.query(
    `UPDATE inscripciones SET comprobante = $1, estado_pago = 'Pendiente'
     WHERE id = $2 RETURNING id, comprobante, estado_pago`,
    [comprobante, id]
  );
  return result.rows[0] || null;
}

async function actualizarEstadoPago(id, estado) {
  const result = await db.query(
    `UPDATE inscripciones SET estado_pago = $1 WHERE id = $2
     RETURNING id, id_carrera, id_modalidad, apellido, nombre, nombre_completo,
               dni, fecha_nacimiento, sexo, email, telefono, ciudad,
               edad, categoria, comprobante, estado_pago, fecha_inscripcion`,
    [estado, id]
  );
  return result.rows[0] || null;
}

async function findAprobadasParaExport(filtros = {}) {
  const condiciones = [`i.estado_pago = 'Aprobado'`];
  const valores = [];

  if (filtros.id_carrera) {
    valores.push(filtros.id_carrera);
    condiciones.push(`i.id_carrera = $${valores.length}`);
  }

  const result = await db.query(
    `SELECT
        i.id,
        i.apellido, i.nombre, i.nombre_completo,
        i.dni, i.fecha_nacimiento, i.sexo,
        i.email, i.telefono, i.ciudad,
        i.edad, i.categoria, i.estado_pago, i.fecha_inscripcion,
        c.nombre AS carrera_nombre, c.tipo AS carrera_tipo, c.fecha_evento,
        m.nombre AS modalidad_nombre, m.distancia AS modalidad_distancia
     FROM inscripciones i
     JOIN carreras c ON c.id = i.id_carrera
     JOIN modalidades m ON m.id = i.id_modalidad
     WHERE ${condiciones.join(' AND ')}
     ORDER BY c.fecha_evento ASC, i.apellido ASC, i.nombre ASC`,
    valores
  );
  return result.rows;
}

module.exports = {
  findAll, findById, existeInscripcion,
  create, actualizarComprobante, actualizarEstadoPago, findAprobadasParaExport
};
