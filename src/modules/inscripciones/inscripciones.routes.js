const express = require('express');
const inscripcionesController = require('./inscripciones.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const { upload } = require('../../config/multer.config');

const router = express.Router();

// Ruta publica - registro de inscripcion (formulario)
router.post('/', inscripcionesController.registrar);

// Ruta publica - subida de comprobante (multipart/form-data, campo "comprobante")
router.post('/:id/comprobante', upload.single('comprobante'), inscripcionesController.subirComprobante);

// Rutas protegidas [admin]
router.get(
  '/',
  authMiddleware,
  roleMiddleware('super_admin', 'organizador'),
  inscripcionesController.listar
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('super_admin', 'organizador'),
  inscripcionesController.obtener
);

router.get(
  '/:id/comprobante',
  authMiddleware,
  roleMiddleware('super_admin', 'organizador'),
  inscripcionesController.descargarComprobante
);

module.exports = router;
