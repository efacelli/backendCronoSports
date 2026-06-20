const express = require('express');
const modalidadesController = require('./modalidades.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');

const router = express.Router();

// Rutas publicas
router.get('/', modalidadesController.listar); // ?carrera_id=
router.get('/:id', modalidadesController.obtener);

// Rutas protegidas [admin]
router.post('/', authMiddleware, roleMiddleware('super_admin', 'organizador'), modalidadesController.crear);
router.put('/:id', authMiddleware, roleMiddleware('super_admin', 'organizador'), modalidadesController.actualizar);
router.delete('/:id', authMiddleware, roleMiddleware('super_admin'), modalidadesController.eliminar);

module.exports = router;
