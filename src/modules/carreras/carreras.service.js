const repo = require('./carreras.repository');

const TIPOS_VALIDOS   = ['running', 'duatlon', 'ciclismo', 'triatlon'];
const ESTADOS_VALIDOS = ['activa', 'cerrada', 'finalizada', 'eliminada', 'archivada'];

function validar(data, { esCreacion }) {
  const errores = [];
  if (esCreacion) {
    if (!data.nombre)       errores.push('"nombre" es obligatorio');
    if (!data.tipo)         errores.push('"tipo" es obligatorio');
    if (!data.fecha_evento) errores.push('"fecha_evento" es obligatorio');
  }
  if (data.tipo   && !TIPOS_VALIDOS.includes(data.tipo))
    errores.push(`"tipo" debe ser: ${TIPOS_VALIDOS.join(', ')}`);
  if (data.estado && !ESTADOS_VALIDOS.includes(data.estado))
    errores.push(`"estado" debe ser: ${ESTADOS_VALIDOS.join(', ')}`);
  if (data.cupo_maximo !== undefined && Number(data.cupo_maximo) < 0)
    errores.push('"cupo_maximo" no puede ser negativo');
  if (data.precio_base !== undefined && Number(data.precio_base) < 0)
    errores.push('"precio_base" no puede ser negativo');
  return errores;
}

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function listarArchivadas() {
  return repo.findAll({ soloArchivadas: true });
}

async function obtenerPorId(id) {
  const carrera = await repo.findById(id);
  if (!carrera) {
    const e = new Error('Carrera no encontrada'); e.statusCode = 404; throw e;
  }
  const inscriptosActivos = await repo.countInscripcionesActivas(id);
  return {
    ...carrera,
    cupos_disponibles:  Math.max(carrera.cupo_maximo - inscriptosActivos, 0),
    inscriptos_activos: inscriptosActivos
  };
}

async function crear(data) {
  const errores = validar(data, { esCreacion: true });
  if (errores.length) { const e = new Error(errores.join('. ')); e.statusCode = 400; throw e; }
  return repo.create(data);
}

async function actualizar(id, data) {
  const errores = validar(data, { esCreacion: false });
  if (errores.length) { const e = new Error(errores.join('. ')); e.statusCode = 400; throw e; }
  const c = await repo.update(id, data);
  if (!c) { const e = new Error('Carrera no encontrada'); e.statusCode = 404; throw e; }
  return c;
}

/** Borrado lógico — nunca elimina inscripciones */
async function eliminar(id) {
  const c = await repo.softDelete(id);
  if (!c) { const e = new Error('Carrera no encontrada'); e.statusCode = 404; throw e; }
  return c;
}

async function archivar(id) {
  const c = await repo.archivar(id);
  if (!c) { const e = new Error('Carrera no encontrada'); e.statusCode = 404; throw e; }
  return c;
}

async function restaurar(id) {
  const c = await repo.restaurar(id);
  if (!c) { const e = new Error('Carrera no encontrada'); e.statusCode = 404; throw e; }
  return c;
}

module.exports = { listar, listarArchivadas, obtenerPorId, crear, actualizar, eliminar, archivar, restaurar };
