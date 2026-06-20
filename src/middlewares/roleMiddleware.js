/**
 * Middleware de autorizacion por rol.
 * Debe usarse SIEMPRE despues de authMiddleware, ya que depende
 * de req.admin establecido por ese middleware.
 *
 * Uso:
 *   router.post('/carreras', authMiddleware, roleMiddleware('super_admin'), controller)
 *   router.post('/carreras', authMiddleware, roleMiddleware('super_admin', 'organizador'), controller)
 *
 * @param  {...string} rolesPermitidos - Roles que pueden acceder al recurso
 */
function roleMiddleware(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.admin.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos suficientes para realizar esta accion'
      });
    }

    return next();
  };
}

module.exports = roleMiddleware;
