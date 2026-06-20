const dashboardService = require('./dashboard.service');

/**
 * GET /api/dashboard/resumen
 * Protegido [admin]. Totales generales de la plataforma.
 */
async function resumen(req, res, next) {
  try {
    const data = await dashboardService.obtenerResumen();

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/dashboard/inscripciones-por-carrera
 * Protegido [admin].
 */
async function inscripcionesPorCarrera(req, res, next) {
  try {
    const data = await dashboardService.obtenerInscripcionesPorCarrera();

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/dashboard/inscripciones-por-fecha
 * Protegido [admin].
 */
async function inscripcionesPorFecha(req, res, next) {
  try {
    const data = await dashboardService.obtenerInscripcionesPorFecha();

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/dashboard/inscripciones-por-categoria
 * Protegido [admin].
 */
async function inscripcionesPorCategoria(req, res, next) {
  try {
    const data = await dashboardService.obtenerInscripcionesPorCategoria();

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/dashboard/inscripciones-por-sexo
 * Protegido [admin].
 */
async function inscripcionesPorSexo(req, res, next) {
  try {
    const data = await dashboardService.obtenerInscripcionesPorSexo();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/dashboard/inscripciones-por-modalidad
 * Protegido [admin].
 */
async function inscripcionesPorModalidad(req, res, next) {
  try {
    const data = await dashboardService.obtenerInscripcionesPorModalidad();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/dashboard/evolucion
 * Protegido [admin]. Inscripciones diarias ultimos 30 dias.
 */
async function evolucionInscripciones(req, res, next) {
  try {
    const data = await dashboardService.obtenerEvolucionInscripciones();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  resumen,
  inscripcionesPorCarrera,
  inscripcionesPorFecha,
  inscripcionesPorCategoria,
  inscripcionesPorSexo,
  inscripcionesPorModalidad,
  evolucionInscripciones
};
