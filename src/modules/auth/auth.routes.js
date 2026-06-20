const express = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

// POST /api/auth/login - Login de administradores
router.post('/login', authController.login);

// GET /api/auth/me - Datos del admin autenticado
router.get('/me', authMiddleware, authController.me);

module.exports = router;
