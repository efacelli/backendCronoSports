const { enviarEmail } = require('../../config/mailer');
const db = require('../../config/db');

// ─── Templates HTML ───────────────────────────────────────────────────────────

function templateBase(contenido) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Crono Sports</title>
</head>
<body style="margin:0;padding:0;background:#F5EFE4;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5EFE4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;
                    overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#10243E;padding:28px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="background:#FF5A3C;color:#10243E;font-weight:900;
                               padding:4px 10px;border-radius:6px;font-size:13px;
                               letter-spacing:1px;">CRONO</span>
                  <span style="color:#F5EFE4;font-size:18px;font-weight:700;
                               margin-left:10px;vertical-align:middle;">Crono Sports</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Contenido -->
        <tr>
          <td style="padding:36px 36px 28px;">
            ${contenido}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#10243E;padding:20px 36px;text-align:center;">
            <p style="color:#9AABBF;font-size:12px;margin:0;">
              © ${new Date().getFullYear()} Crono Sports · Santiago del Estero, AR<br/>
              <a href="mailto:cronosport.arg@gmail.com"
                 style="color:#FF5A3C;text-decoration:none;">cronosport.arg@gmail.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function templateInscripcionRecibida({ nombre, carrera, modalidad }) {
  return templateBase(`
    <h1 style="color:#10243E;font-size:22px;margin:0 0 8px;">
      ¡Inscripción recibida!
    </h1>
    <p style="color:#6B7785;font-size:14px;margin:0 0 24px;">
      Te confirmamos que recibimos tu solicitud.
    </p>

    <p style="color:#0B1626;font-size:15px;margin:0 0 20px;">
      Hola <strong>${nombre}</strong>,
    </p>
    <p style="color:#0B1626;font-size:15px;margin:0 0 24px;">
      Hemos recibido correctamente tu inscripción para:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#F5EFE4;border-radius:8px;padding:20px;margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;">
          <span style="color:#6B7785;font-size:13px;display:block;">Carrera</span>
          <span style="color:#10243E;font-weight:700;font-size:15px;">${carrera}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;">
          <span style="color:#6B7785;font-size:13px;display:block;">Modalidad</span>
          <span style="color:#10243E;font-weight:700;font-size:15px;">${modalidad}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;">
          <span style="color:#6B7785;font-size:13px;display:block;">Estado actual</span>
          <span style="background:#E0A526;color:#fff;font-weight:700;font-size:13px;
                       padding:3px 12px;border-radius:20px;display:inline-block;
                       margin-top:4px;">PENDIENTE DE APROBACIÓN</span>
        </td>
      </tr>
    </table>

    <div style="border-left:4px solid #FF5A3C;padding:12px 16px;
                background:#fff8f6;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="color:#0B1626;font-size:14px;margin:0;">
        <strong>Recordá conservar el comprobante de transferencia</strong>
        ya que puede ser solicitado por el organizador.
      </p>
    </div>

    <p style="color:#0B1626;font-size:15px;margin:0 0 8px;">
      Te notificaremos por correo electrónico cuando tu inscripción sea aprobada.
    </p>
    <p style="color:#0B1626;font-size:15px;margin:0 0 24px;">
      Gracias por participar. ¡Muchos éxitos!
    </p>

    <p style="color:#6B7785;font-size:14px;margin:0;">
      Saludos,<br/>
      <strong style="color:#10243E;">Crono Sports</strong>
    </p>
  `);
}

function templateInscripcionAprobada({ nombre, carrera, modalidad, fecha, ubicacion }) {
  return templateBase(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#3FA66B;border-radius:50%;
                  width:56px;height:56px;line-height:56px;text-align:center;
                  font-size:28px;">✓</div>
    </div>

    <h1 style="color:#10243E;font-size:22px;margin:0 0 8px;text-align:center;">
      ¡Tu inscripción fue aprobada!
    </h1>
    <p style="color:#6B7785;font-size:14px;margin:0 0 28px;text-align:center;">
      Ya estás confirmado para participar.
    </p>

    <p style="color:#0B1626;font-size:15px;margin:0 0 20px;">
      Hola <strong>${nombre}</strong>,
    </p>
    <p style="color:#0B1626;font-size:15px;margin:0 0 24px;">
      Tu inscripción ha sido <strong style="color:#3FA66B;">APROBADA</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#F5EFE4;border-radius:8px;padding:20px;margin-bottom:28px;">
      <tr>
        <td style="padding:6px 0;">
          <span style="color:#6B7785;font-size:13px;display:block;">Carrera</span>
          <span style="color:#10243E;font-weight:700;font-size:15px;">${carrera}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;">
          <span style="color:#6B7785;font-size:13px;display:block;">Modalidad</span>
          <span style="color:#10243E;font-weight:700;font-size:15px;">${modalidad}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;">
          <span style="color:#6B7785;font-size:13px;display:block;">Fecha del evento</span>
          <span style="color:#10243E;font-weight:700;font-size:15px;">${fecha}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;">
          <span style="color:#6B7785;font-size:13px;display:block;">Ubicación</span>
          <span style="color:#10243E;font-weight:700;font-size:15px;">${ubicacion || '—'}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;">
          <span style="color:#6B7785;font-size:13px;display:block;">Estado</span>
          <span style="background:#3FA66B;color:#fff;font-weight:700;font-size:13px;
                       padding:3px 12px;border-radius:20px;display:inline-block;
                       margin-top:4px;">APROBADA</span>
        </td>
      </tr>
    </table>

    <p style="color:#0B1626;font-size:15px;margin:0 0 8px;">
      Te esperamos el día del evento.
    </p>
    <p style="color:#0B1626;font-size:15px;margin:0 0 24px;">
      Muchos éxitos y gracias por participar.
    </p>

    <p style="color:#6B7785;font-size:14px;margin:0;">
      Saludos,<br/>
      <strong style="color:#10243E;">Crono Sports</strong>
    </p>
  `);
}

// ─── Funciones públicas ───────────────────────────────────────────────────────

/**
 * Envía el email de confirmación de inscripción y registra en BD.
 * Si falla el email, NO lanza error — solo loguea.
 */
async function notificarInscripcion(inscripcion) {
  if (!inscripcion.email) return { ok: false, error: 'Sin email' };

  const nombre   = inscripcion.nombre || inscripcion.nombre_completo || 'Participante';
  const carrera  = inscripcion.carrera_nombre  || '—';
  const modalidad = inscripcion.modalidad_nombre || inscripcion.categoria || '—';

  const result = await enviarEmail({
    to:      inscripcion.email,
    subject: 'Inscripción recibida - Crono Sports',
    html:    templateInscripcionRecibida({ nombre, carrera, modalidad })
  });

  // Registra en BD siempre, aunque haya fallado
  await db.query(
    `UPDATE inscripciones
     SET email_inscripcion_enviado = $1,
         email_inscripcion_fecha   = $2
     WHERE id = $3`,
    [result.ok, result.ok ? new Date() : null, inscripcion.id]
  );

  if (!result.ok) {
    console.error(`[Email] Error notificarInscripcion id=${inscripcion.id}:`, result.error);
  }

  return result;
}

/**
 * Envía el email de aprobación y registra en BD.
 * Evita duplicados: si ya fue enviado, retorna { ok: false, duplicate: true }.
 */
async function notificarAprobacion(inscripcion) {
  if (!inscripcion.email) return { ok: false, error: 'Sin email' };

  // Evita duplicados
  if (inscripcion.email_aprobacion_enviado) {
    return { ok: false, duplicate: true };
  }

  const nombre    = inscripcion.nombre || inscripcion.nombre_completo || 'Participante';
  const carrera   = inscripcion.carrera_nombre   || '—';
  const modalidad = inscripcion.modalidad_nombre || inscripcion.categoria || '—';
  const fecha     = inscripcion.fecha_evento
    ? new Date(inscripcion.fecha_evento).toLocaleDateString('es-AR', { timeZone: 'UTC' })
    : '—';
  const ubicacion = inscripcion.ubicacion || '—';

  const result = await enviarEmail({
    to:      inscripcion.email,
    subject: 'Inscripción aprobada - Crono Sports',
    html:    templateInscripcionAprobada({ nombre, carrera, modalidad, fecha, ubicacion })
  });

  await db.query(
    `UPDATE inscripciones
     SET email_aprobacion_enviado = $1,
         email_aprobacion_fecha   = $2
     WHERE id = $3`,
    [result.ok, result.ok ? new Date() : null, inscripcion.id]
  );

  if (!result.ok) {
    console.error(`[Email] Error notificarAprobacion id=${inscripcion.id}:`, result.error);
  }

  return result;
}

module.exports = { notificarInscripcion, notificarAprobacion };
