const modalidadesRepository = require('./modalidades.repository');
const carrerasRepository = require('../carreras/carreras.repository');

const SEXOS_VALIDOS = ['masculino', 'femenino', 'otro'];

/**
 * Valida los datos de entrada para crear/actualizar una modalidad.
 */
function validarDatosModalidad(data, { esCreacion }) {
  const errores = [];

  if (esCreacion) {
    if (!data.id_carrera) errores.push('El campo "id_carrera" es obligatorio');
    if (!data.nombre) errores.push('El campo "nombre" es obligatorio');
  }

  if (data.sexo !== undefined && !SEXOS_VALIDOS.includes(data.sexo)) {
    errores.push(`El campo "sexo" debe ser uno de: ${SEXOS_VALIDOS.join(', ')}`);
  }

  const edadMin = data.edad_minima;
  const edadMax = data.edad_maxima;

  if (edadMin !== undefined && Number(edadMin) < 0) {
    errores.push('El campo "edad_minima" no puede ser negativo');
  }

  if (edadMin !== undefined && edadMax !== undefined && Number(edadMin) > Number(edadMax)) {
    errores.push('"edad_minima" no puede ser mayor que "edad_maxima"');
  }

  if (data.precio_extra !== undefined && Number(data.precio_extra) < 0) {
    errores.push('El campo "precio_extra" no puede ser negativo');
  }

  return errores;
}

async function listarPorCarrera(idCarrera) {
  const carrera = await carrerasRepository.findById(idCarrera);

  if (!carrera) {
    const error = new Error('Carrera no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return modalidadesRepository.findByCarrera(idCarrera);
}

async function obtenerPorId(id) {
  const modalidad = await modalidadesRepository.findById(id);

  if (!modalidad) {
    const error = new Error('Modalidad no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return modalidad;
}

async function crear(data) {
  const errores = validarDatosModalidad(data, { esCreacion: true });

  if (errores.length > 0) {
    const error = new Error(errores.join('. '));
    error.statusCode = 400;
    throw error;
  }

  const carrera = await carrerasRepository.findById(data.id_carrera);

  if (!carrera) {
    const error = new Error('La carrera indicada no existe');
    error.statusCode = 404;
    throw error;
  }

  return modalidadesRepository.create(data);
}

async function actualizar(id, data) {
  const errores = validarDatosModalidad(data, { esCreacion: false });

  if (errores.length > 0) {
    const error = new Error(errores.join('. '));
    error.statusCode = 400;
    throw error;
  }

  const modalidad = await modalidadesRepository.update(id, data);

  if (!modalidad) {
    const error = new Error('Modalidad no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return modalidad;
}

async function eliminar(id) {
  const modalidad = await modalidadesRepository.remove(id);

  if (!modalidad) {
    const error = new Error('Modalidad no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return modalidad;
}

module.exports = {
  listarPorCarrera,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
