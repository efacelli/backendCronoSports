const express = require('express');
const exportacionController = require('./exportacion.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');

const router = express.Router();

// GET /api/export/inscripciones?id_carrera=  [admin]
router.get(
  '/inscripciones',
  authMiddleware,
  roleMiddleware('super_admin', 'organizador'),
  exportacionController.exportarInscriptosAprobados
);

module.exports = router;
