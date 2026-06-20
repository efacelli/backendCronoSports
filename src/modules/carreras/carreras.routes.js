const express = require('express');
const ctrl    = require('./carreras.controller');
const auth    = require('../../middlewares/authMiddleware');
const role    = require('../../middlewares/roleMiddleware');

const router  = express.Router();
const admin   = [auth, role('super_admin', 'organizador')];
const superAdmin = [auth, role('super_admin')];

// Públicas
router.get('/',           ctrl.listar);
router.get('/:id',        ctrl.obtener);

// Admin
router.get('/admin/archivadas',      ...admin,    ctrl.listarArchivadas);
router.post('/',                     ...admin,    ctrl.crear);
router.put('/:id',                   ...admin,    ctrl.actualizar);
router.patch('/:id/archivar',        ...admin,    ctrl.archivar);
router.patch('/:id/restaurar',       ...admin,    ctrl.restaurar);
router.delete('/:id',                ...superAdmin, ctrl.eliminar);

module.exports = router;
