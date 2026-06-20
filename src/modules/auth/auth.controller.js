const authService = require('./auth.service');

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y password son obligatorios'
      });
    }

    const { token, admin } = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: { token, admin }
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/auth/me
 * Requiere autenticacion. Devuelve los datos del admin logueado.
 */
async function me(req, res, next) {
  try {
    const admin = await authService.getMe(req.admin.id);

    return res.status(200).json({
      success: true,
      data: admin
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
  me
};
