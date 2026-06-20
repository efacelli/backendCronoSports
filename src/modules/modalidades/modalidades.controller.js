const modalidadesService = require('./modalidades.service');

/**
 * GET /api/modalidades?carrera_id=
 * Publico.
 */
async function listar(req, res, next) {
  try {
    const { carrera_id } = req.query;

    if (!carrera_id) {
      return res.status(400).json({
        success: false,
        message: 'El parametro "carrera_id" es obligatorio'
      });
    }

    const modalidades = await modalidadesService.listarPorCarrera(carrera_id);

    return res.status(200).json({
      success: true,
      data: modalidades
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/modalidades/:id
 * Publico.
 */
async function obtener(req, res, next) {
  try {
    const modalidad = await modalidadesService.obtenerPorId(req.params.id);

    return res.status(200).json({
      success: true,
      data: modalidad
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/modalidades
 * Protegido [admin].
 */
async function crear(req, res, next) {
  try {
    const modalidad = await modalidadesService.crear(req.body);

    return res.status(201).json({
      success: true,
      message: 'Modalidad creada correctamente',
      data: modalidad
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUT /api/modalidades/:id
 * Protegido [admin].
 */
async function actualizar(req, res, next) {
  try {
    const modalidad = await modalidadesService.actualizar(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Modalidad actualizada correctamente',
      data: modalidad
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /api/modalidades/:id
 * Protegido [admin].
 */
async function eliminar(req, res, next) {
  try {
    await modalidadesService.eliminar(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Modalidad eliminada correctamente'
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
};
