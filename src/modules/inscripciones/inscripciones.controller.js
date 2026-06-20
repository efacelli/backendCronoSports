const path = require('path');
const inscripcionesService = require('./inscripciones.service');
const { UPLOAD_DIR } = require('../../config/multer.config');

/**
 * POST /api/inscripciones
 * Publico. Registra una nueva inscripcion (sin comprobante todavia).
 * Body: { id_carrera, nombre_completo, dni, fecha_nacimiento, sexo, ciudad }
 */
async function registrar(req, res, next) {
  try {
    const inscripcion = await inscripcionesService.registrar(req.body);

    return res.status(201).json({
      success: true,
      message: 'Inscripcion registrada correctamente. Ahora puede subir el comprobante de pago.',
      data: inscripcion
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/inscripciones
 * Protegido [admin]. Lista inscripciones con filtros opcionales:
 * ?id_carrera=&estado_pago=&dni=
 */
async function listar(req, res, next) {
  try {
    const { id_carrera, estado_pago, dni } = req.query;

    const inscripciones = await inscripcionesService.listar({
      id_carrera,
      estado_pago,
      dni
    });

    return res.status(200).json({
      success: true,
      data: inscripciones
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/inscripciones/:id
 * Protegido [admin].
 */
async function obtener(req, res, next) {
  try {
    const inscripcion = await inscripcionesService.obtenerPorId(req.params.id);

    return res.status(200).json({
      success: true,
      data: inscripcion
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/inscripciones/:id/comprobante
 * Publico. Sube el comprobante de pago (multipart/form-data, campo "comprobante").
 * Requiere haber registrado previamente la inscripcion.
 */
async function subirComprobante(req, res, next) {
  try {
    const actualizado = await inscripcionesService.subirComprobante(req.params.id, req.file);

    return res.status(200).json({
      success: true,
      message: 'Comprobante subido correctamente. Su pago sera revisado por un administrador.',
      data: actualizado
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/inscripciones/:id/comprobante
 * Protegido [admin]. Devuelve el archivo de comprobante para visualizacion/descarga.
 */
async function descargarComprobante(req, res, next) {
  try {
    const inscripcion = await inscripcionesService.obtenerPorId(req.params.id);

    if (!inscripcion.comprobante) {
      return res.status(404).json({
        success: false,
        message: 'Esta inscripcion no tiene comprobante cargado'
      });
    }

    const fs = require('fs');
    const rutaArchivo = path.join(UPLOAD_DIR, path.basename(inscripcion.comprobante));

    if (!fs.existsSync(rutaArchivo)) {
      return res.status(404).json({
        success: false,
        message: 'El archivo de comprobante no existe en el servidor (puede haber sido movido o eliminado)'
      });
    }

    return res.sendFile(rutaArchivo, (err) => {
      if (err && !res.headersSent) {
        next(err);
      }
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  registrar,
  listar,
  obtener,
  subirComprobante,
  descargarComprobante
};
