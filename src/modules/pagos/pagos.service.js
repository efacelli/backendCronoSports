const inscripcionesRepository = require('../inscripciones/inscripciones.repository');

/**
 * Lista inscripciones filtrando por estado de pago.
 * Reutiliza el repositorio de inscripciones ya que el pago
 * esta modelado como un atributo (estado_pago) de la inscripcion.
 *
 * @param {Object} filtros - { estado_pago, id_carrera }
 */
async function listarPorEstado(filtros = {}) {
  return inscripcionesRepository.findAll(filtros);
}

/**
 * Aprueba el pago de una inscripcion.
 * Requiere que la inscripcion tenga un comprobante cargado.
 */
async function aprobar(id) {
  const inscripcion = await inscripcionesRepository.findById(id);

  if (!inscripcion) {
    const error = new Error('Inscripcion no encontrada');
    error.statusCode = 404;
    throw error;
  }

  if (!inscripcion.comprobante) {
    const error = new Error('No se puede aprobar un pago sin comprobante cargado');
    error.statusCode = 400;
    throw error;
  }

  if (inscripcion.estado_pago === 'Aprobado') {
    const error = new Error('El pago ya se encuentra aprobado');
    error.statusCode = 409;
    throw error;
  }

  return inscripcionesRepository.actualizarEstadoPago(id, 'Aprobado');
}

/**
 * Rechaza el pago de una inscripcion.
 */
async function rechazar(id) {
  const inscripcion = await inscripcionesRepository.findById(id);

  if (!inscripcion) {
    const error = new Error('Inscripcion no encontrada');
    error.statusCode = 404;
    throw error;
  }

  if (inscripcion.estado_pago === 'Rechazado') {
    const error = new Error('El pago ya se encuentra rechazado');
    error.statusCode = 409;
    throw error;
  }

  return inscripcionesRepository.actualizarEstadoPago(id, 'Rechazado');
}

/**
 * Vuelve a poner un pago en estado "Pendiente" (por ejemplo,
 * para permitir que el participante reenvie el comprobante).
 */
async function reabrir(id) {
  const inscripcion = await inscripcionesRepository.findById(id);

  if (!inscripcion) {
    const error = new Error('Inscripcion no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return inscripcionesRepository.actualizarEstadoPago(id, 'Pendiente');
}

module.exports = {
  listarPorEstado,
  aprobar,
  rechazar,
  reabrir
};
