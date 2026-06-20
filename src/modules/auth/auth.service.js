const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const env = require('../../config/env');

/**
 * Autentica a un administrador por email y password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, admin: object}>}
 */
async function login(email, password) {
  const result = await db.query(
    'SELECT id, nombre, email, password_hash, rol FROM admins WHERE email = $1',
    [email]
  );

  const admin = result.rows[0];

  if (!admin) {
    const error = new Error('Credenciales invalidas');
    error.statusCode = 401;
    throw error;
  }

  const passwordValido = await bcrypt.compare(password, admin.password_hash);

  if (!passwordValido) {
    const error = new Error('Credenciales invalidas');
    error.statusCode = 401;
    throw error;
  }

  const payload = {
    id: admin.id,
    email: admin.email,
    rol: admin.rol,
    nombre: admin.nombre
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });

  return {
    token,
    admin: payload
  };
}

/**
 * Obtiene los datos publicos del admin autenticado.
 * @param {number} id
 */
async function getMe(id) {
  const result = await db.query(
    'SELECT id, nombre, email, rol, created_at FROM admins WHERE id = $1',
    [id]
  );

  const admin = result.rows[0];

  if (!admin) {
    const error = new Error('Administrador no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return admin;
}

module.exports = {
  login,
  getMe
};
