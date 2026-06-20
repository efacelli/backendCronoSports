const pagosService = require('./pagos.service');

/**
 * GET /api/pagos?estado_pago=Pendiente&id_carrera=
 * Protegido [admin]. Lista inscripciones filtradas por estado de pago.
 */
async function listar(req, res, next) {
  try {
    const { estado_pago, id_carrera } = req.query;

    const pagos = await pagosService.listarPorEstado({ estado_pago, id_carrera });

    return res.status(200).json({
      success: true,
      data: pagos
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/pagos/:id/aprobar
 * Protegido [admin].
 */
async function aprobar(req, res, next) {
  try {
    const inscripcion = await pagosService.aprobar(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Pago aprobado correctamente. La inscripcion ha sido confirmada.',
      data: inscripcion
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/pagos/:id/rechazar
 * Protegido [admin].
 */
async function rechazar(req, res, next) {
  try {
    const inscripcion = await pagosService.rechazar(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Pago rechazado correctamente.',
      data: inscripcion
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/pagos/:id/reabrir
 * Protegido [admin]. Vuelve el estado de pago a "Pendiente".
 */
async function reabrir(req, res, next) {
  try {
    const inscripcion = await pagosService.reabrir(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'El estado del pago fue reestablecido a Pendiente.',
      data: inscripcion
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listar,
  aprobar,
  rechazar,
  reabrir
};
