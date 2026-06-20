const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Middleware de autenticacion.
 * Verifica que la peticion incluya un token JWT valido en el header
 * Authorization: Bearer <token>.
 *
 * Si el token es valido, agrega la informacion del admin a req.admin.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado o con formato invalido'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    // payload esperado: { id, email, rol }
    req.admin = payload;

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token ha expirado, inicie sesion nuevamente'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token invalido'
    });
  }
}

module.exports = authMiddleware;
