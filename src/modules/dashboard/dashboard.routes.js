const express = require('express');
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');

const router = express.Router();

// Todas las rutas del dashboard son exclusivas de administradores
router.use(authMiddleware, roleMiddleware('super_admin', 'organizador'));

router.get('/resumen', dashboardController.resumen);
router.get('/inscripciones-por-carrera', dashboardController.inscripcionesPorCarrera);
router.get('/inscripciones-por-fecha', dashboardController.inscripcionesPorFecha);
router.get('/inscripciones-por-categoria', dashboardController.inscripcionesPorCategoria);
router.get('/inscripciones-por-sexo', dashboardController.inscripcionesPorSexo);
router.get('/inscripciones-por-modalidad', dashboardController.inscripcionesPorModalidad);
router.get('/evolucion', dashboardController.evolucionInscripciones);

module.exports = router;
