const { enviarEmailAprobacion } = require('./emails.service');

/**
 * POST /api/emails/:id/aprobacion
 * Envía (o reenvía si force=true) el email de aprobación al corredor.
 * Protegido [admin].
 */
async function notificarAprobacion(req, res, next) {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true';

    const resultado = await enviarEmailAprobacion(id, force);

    if (resultado.yaEnviado) {
      return res.status(200).json({
        success: true,
        yaEnviado: true,
        message: 'El email de aprobación ya fue enviado anteriormente. Usá ?force=true para reenviar.'
      });
    }

    if (!resultado.enviado) {
      return res.status(500).json({
        success: false,
        message: resultado.error || 'No se pudo enviar el email. Verificá la configuración SMTP.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email de aprobación enviado correctamente.'
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { notificarAprobacion };
