const db = require('../../config/db');

const CAMPOS_SELECT = `
  id, nombre, tipo, fecha_evento, ubicacion, descripcion,
  cupo_maximo, precio_base, estado, imagen_portada_url,
  alias, cbu, whatsapp, url_mapa, imagen_recorrido_url, created_at
`;

// Estados considerados "activos" (visibles en listado normal)
const ESTADOS_ACTIVOS = `('activa','cerrada','finalizada')`;

async function findAll(filtros = {}) {
  const conds = [];
  const vals = [];

  // Por defecto excluye eliminadas y archivadas del listado público
  if (filtros.incluirEliminadas) {
    // no filtra por estado
  } else if (filtros.soloArchivadas) {
    conds.push(`estado IN ('eliminada','archivada')`);
  } else {
    conds.push(`estado IN ${ESTADOS_ACTIVOS}`);
  }

  if (filtros.estado) { vals.push(filtros.estado); conds.push(`estado = $${vals.length}`); }
  if (filtros.tipo) { vals.push(filtros.tipo); conds.push(`tipo   = $${vals.length}`); }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const result = await db.query(
    `SELECT ${CAMPOS_SELECT} FROM carreras ${where} ORDER BY fecha_evento ASC`,
    vals
  );
  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    `SELECT ${CAMPOS_SELECT} FROM carreras WHERE id = $1`, [id]
  );
  return result.rows[0] || null;
}

async function countInscripcionesActivas(idCarrera) {
  const result = await db.query(
    `SELECT COUNT(*)::int AS total FROM inscripciones
     WHERE id_carrera = $1 AND estado_pago <> 'Rechazado'`,
    [idCarrera]
  );
  return result.rows[0].total;
}

async function create(data) {
  const {
    nombre, tipo, fecha_evento, ubicacion, descripcion,
    cupo_maximo, precio_base, estado, imagen_portada_url,
    alias, cbu, whatsapp, url_mapa, imagen_recorrido_url
  } = data;

  const result = await db.query(
    `INSERT INTO carreras
       (nombre, tipo, fecha_evento, ubicacion, descripcion, cupo_maximo, precio_base,
        estado, imagen_portada_url, alias, cbu, whatsapp, url_mapa, imagen_recorrido_url,
        campo_talle, campo_club, campo_tel_emergencia, campo_obra_social,
        campo_grupo_sanguineo, campo_examen_medico, campo_cert_medico, campo_link_ironman)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
     RETURNING ${CAMPOS_SELECT}`,
    [
      nombre, tipo, fecha_evento,
      ubicacion || null, descripcion || null,
      cupo_maximo || 0, precio_base || 0,
      estado || 'activa', imagen_portada_url || null,
      alias || null, cbu || null, whatsapp || null,
      url_mapa || null, imagen_recorrido_url || null,
      data.campo_talle || false,
      data.campo_club || false,
      data.campo_tel_emergencia || false,
      data.campo_obra_social || false,
      data.campo_grupo_sanguineo || false,
      data.campo_examen_medico || false,
      data.campo_cert_medico || false,
      data.campo_link_ironman || false
    ]
  );
  return result.rows[0];
}

async function update(id, data) {
  const permitidos = [
  'nombre','tipo','fecha_evento','ubicacion','descripcion',
  'cupo_maximo','precio_base','estado','imagen_portada_url',
  'alias','cbu','whatsapp','url_mapa','imagen_recorrido_url',
  'campo_talle','campo_club','campo_tel_emergencia','campo_obra_social',
  'campo_grupo_sanguineo','campo_examen_medico','campo_cert_medico',
  'campo_link_ironman'
];
  const campos = []; const vals = []; let idx = 1;
  for (const campo of permitidos) {
    if (data[campo] !== undefined) { campos.push(`${campo} = $${idx}`); vals.push(data[campo]); idx++; }
  }
  if (!campos.length) return findById(id);
  vals.push(id);
  const result = await db.query(
    `UPDATE carreras SET ${campos.join(', ')} WHERE id = $${idx} RETURNING ${CAMPOS_SELECT}`,
    vals
  );
  return result.rows[0] || null;
}

/** Borrado LÓGICO: cambia estado a 'eliminada' en lugar de DELETE físico */
async function softDelete(id) {
  const result = await db.query(
    `UPDATE carreras SET estado = 'eliminada' WHERE id = $1 RETURNING id, nombre`,
    [id]
  );
  return result.rows[0] || null;
}

/** Archivar: estado → 'archivada' */
async function archivar(id) {
  const result = await db.query(
    `UPDATE carreras SET estado = 'archivada' WHERE id = $1 RETURNING id, nombre`,
    [id]
  );
  return result.rows[0] || null;
}

/** Restaurar: estado → 'activa' */
async function restaurar(id) {
  const result = await db.query(
    `UPDATE carreras SET estado = 'activa' WHERE id = $1 RETURNING ${CAMPOS_SELECT}`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  findAll, findById, countInscripcionesActivas,
  create, update,
  softDelete, archivar, restaurar
};
