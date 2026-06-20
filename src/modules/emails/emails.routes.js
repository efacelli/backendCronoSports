const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const inscripcionesRepository = require('../inscripciones/inscripciones.repository');
const { notificarAprobacion }  = require('./emails.service');

const router = express.Router();

/**
 * POST /api/emails/notificar-aprobacion/:id
 * Protegido [admin]. Envía el email de aprobación al corredor.
 * Registra el envío y evita duplicados.
 */
router.post(
  '/notificar-aprobacion/:id',
  authMiddleware,
  roleMiddleware('super_admin', 'organizador'),
  async (req, res, next) => {
    try {
      const insc = await inscripcionesRepository.findById(req.params.id);

      if (!insc) {
        return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
      }

      if (insc.estado_pago !== 'Aprobado') {
        return res.status(400).json({
          success: false,
          message: 'Solo se puede notificar a inscripciones con estado "Aprobado"'
        });
      }

      if (!insc.email) {
        return res.status(400).json({
          success: false,
          message: 'Este inscripto no tiene email registrado'
        });
      }

      const result = await notificarAprobacion(insc);

      if (result.duplicate) {
        return res.status(409).json({
          success: false,
          message: 'El email de aprobación ya fue enviado anteriormente',
          fecha: insc.email_aprobacion_fecha
        });
      }

      if (!result.ok) {
        return res.status(500).json({
          success: false,
          message: `Error al enviar el email: ${result.error}`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Email de aprobación enviado correctamente'
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
