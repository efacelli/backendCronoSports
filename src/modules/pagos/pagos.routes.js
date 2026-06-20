const express = require('express');
const pagosController = require('./pagos.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');

const router = express.Router();

// Todas las rutas de pagos son exclusivas de administradores
router.use(authMiddleware, roleMiddleware('super_admin', 'organizador'));

// GET /api/pagos?estado_pago=Pendiente&id_carrera=
router.get('/', pagosController.listar);

// PATCH /api/pagos/:id/aprobar
router.patch('/:id/aprobar', pagosController.aprobar);

// PATCH /api/pagos/:id/rechazar
router.patch('/:id/rechazar', pagosController.rechazar);

// PATCH /api/pagos/:id/reabrir
router.patch('/:id/reabrir', pagosController.reabrir);

module.exports = router;
