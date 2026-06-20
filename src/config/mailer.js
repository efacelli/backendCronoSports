const nodemailer = require('nodemailer');
const env = require('./env');

/**
 * Transportador de Nodemailer configurado desde variables de entorno.
 * No se crean credenciales hardcodeadas.
 */
const transporter = nodemailer.createTransport({
  host:   env.SMTP_HOST,
  port:   Number(env.SMTP_PORT || 587),
  secure: Number(env.SMTP_PORT) === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD
  }
});

/**
 * Verifica la conexión SMTP al iniciar el servidor.
 * Si falla, solo loguea — no tira el proceso.
 */
async function verificarConexionSMTP() {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.warn('[Mailer] SMTP no configurado. Los emails no serán enviados.');
    return false;
  }
  try {
    await transporter.verify();
    console.log('[Mailer] Conexión SMTP verificada correctamente.');
    return true;
  } catch (err) {
    console.error('[Mailer] No se pudo conectar al servidor SMTP:', err.message);
    return false;
  }
}

/**
 * Envía un email. Nunca lanza error hacia afuera: si falla,
 * loguea y retorna { ok: false, error }.
 *
 * @param {{ to, subject, html }} opciones
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
async function enviarEmail({ to, subject, html }) {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.warn('[Mailer] Email no enviado (SMTP sin configurar):', subject);
    return { ok: false, error: 'SMTP no configurado' };
  }

  try {
    await transporter.sendMail({
      from:    env.SMTP_FROM || `"Crono Sports" <${env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    console.log(`[Mailer] Email enviado a ${to} — "${subject}"`);
    return { ok: true };
  } catch (err) {
    console.error(`[Mailer] Error al enviar a ${to}:`, err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { transporter, verificarConexionSMTP, enviarEmail };
