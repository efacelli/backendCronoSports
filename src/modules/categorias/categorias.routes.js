const express = require('express');
const ctrl    = require('./categorias.controller');
const auth    = require('../../middlewares/authMiddleware');
const role    = require('../../middlewares/roleMiddleware');

const router  = express.Router();
const admin   = [auth, role('super_admin', 'organizador')];

// Públicas
router.get('/',                            ctrl.listar);
router.get('/:id',                         ctrl.obtener);
router.get('/carrera/:idCarrera',          ctrl.porCarrera);

// Admin
router.post('/',                           ...admin, ctrl.crear);
router.put('/:id',                         ...admin, ctrl.actualizar);
router.delete('/:id',                      ...admin, ctrl.eliminar);
router.post('/generar-estandar',           ...admin, ctrl.estandar);
router.post('/carrera/:idCarrera/:idCategoria',   ...admin, ctrl.asignar);
router.delete('/carrera/:idCarrera/:idCategoria', ...admin, ctrl.desasignar);
router.put('/carrera/:idCarrera/reemplazar',      ...admin, ctrl.reemplazar);

module.exports = router;
