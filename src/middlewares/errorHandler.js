const multer = require('multer');
const env = require('../config/env');

/**
 * Middleware global de manejo de errores.
 * Debe registrarse al final, despues de todas las rutas.
 */
function errorHandler(err, req, res, next) {
  console.error('Error capturado por errorHandler:', err);

  // Errores especificos de Multer (subida de archivos)
  if (err instanceof multer.MulterError) {
    let message = 'Error al subir el archivo';

    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `El archivo excede el tamaño maximo permitido (${env.UPLOAD_MAX_SIZE_MB} MB)`;
    }

    return res.status(400).json({
      success: false,
      message
    });
  }

  // Error de tipo de archivo no permitido (lanzado desde fileFilter)
  if (err.message && err.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Errores de validacion de Postgres (constraint violations)
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'El registro ya existe (violacion de restriccion unica)',
      detail: env.NODE_ENV === 'development' ? err.detail : undefined
    });
  }

  if (err.code === '23503') {
    return res.status(409).json({
      success: false,
      message: 'Operacion invalida: referencia a un registro inexistente',
      detail: env.NODE_ENV === 'development' ? err.detail : undefined
    });
  }

  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'Los datos no cumplen con las restricciones requeridas',
      detail: env.NODE_ENV === 'development' ? err.detail : undefined
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    stack: env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
