/**
 * Template base para todos los emails de Crono Sports.
 */
function base(contenido) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Crono Sports</title>
  <style>
    body { margin:0; padding:0; background:#F5EFE4; font-family:'Helvetica Neue',Arial,sans-serif; }
    .wrapper { max-width:580px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
    .header { background:#10243E; padding:28px 32px; text-align:center; }
    .header-logo { display:inline-block; background:#FF5A3C; color:#10243E; font-weight:900;
                   font-size:13px; letter-spacing:2px; padding:6px 14px; border-radius:6px; }
    .header-title { margin:12px 0 0; color:#F5EFE4; font-size:22px; font-weight:700; }
    .body { padding:32px; color:#0B1626; font-size:15px; line-height:1.7; }
    .data-box { background:#F5EFE4; border-radius:8px; padding:20px 24px; margin:20px 0; }
    .data-row { display:flex; justify-content:space-between; padding:6px 0;
                border-bottom:1px solid #E2DDD6; font-size:14px; }
    .data-row:last-child { border-bottom:none; }
    .data-label { color:#6B7785; }
    .data-value { font-weight:600; color:#10243E; }
    .badge { display:inline-block; padding:4px 14px; border-radius:99px;
             font-size:12px; font-weight:700; letter-spacing:.5px; }
    .badge-pending  { background:#E0A526; color:#fff; }
    .badge-approved { background:#3FA66B; color:#fff; }
    .notice { background:#FFF8EC; border-left:4px solid #E0A526;
              padding:14px 18px; border-radius:0 8px 8px 0; margin:20px 0; font-size:13px; }
    .footer { background:#10243E; padding:20px 32px; text-align:center;
              color:#9AABBF; font-size:12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">CRONO SPORTS</div>
      <p class="header-title">Sistema de Inscripciones</p>
    </div>
    <div class="body">${contenido}</div>
    <div class="footer">
      © ${new Date().getFullYear()} Crono Sports · Santiago del Estero, AR<br/>
      Este email fue generado automáticamente, por favor no respondas este mensaje.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Email enviado al corredor cuando completa la inscripción.
 */
function inscripcionRecibida({ nombre, carrera, modalidad, categoria, bib }) {
  const contenido = `
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>Hemos recibido correctamente tu inscripción. Revisaremos tu comprobante de pago
       y te notificaremos cuando sea aprobada.</p>

    <div class="data-box">
      <div class="data-row">
        <span class="data-label">Número de inscripción</span>
        <span class="data-value">#${String(bib).padStart(5, '0')}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Carrera</span>
        <span class="data-value">${carrera}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Modalidad</span>
        <span class="data-value">${modalidad}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Categoría asignada</span>
        <span class="data-value">${categoria}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Estado</span>
        <span class="data-value">
          <span class="badge badge-pending">PENDIENTE DE APROBACIÓN</span>
        </span>
      </div>
    </div>

    <div class="notice">
      📎 Recordá conservar el comprobante de transferencia ya que puede ser
      solicitado por el organizador.
    </div>

    <p>Te notificaremos por correo electrónico cuando tu inscripción sea aprobada.</p>
    <p>Gracias por participar.<br/><strong>Crono Sports</strong></p>
  `;
  return base(contenido);
}

/**
 * Email enviado al corredor cuando el admin aprueba el pago.
 */
function inscripcionAprobada({ nombre, carrera, modalidad, categoria, fechaEvento, ubicacion, bib }) {
  const contenido = `
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>¡Excelentes noticias! Tu inscripción ha sido <strong>aprobada</strong>.</p>

    <div class="data-box">
      <div class="data-row">
        <span class="data-label">Número de inscripción</span>
        <span class="data-value">#${String(bib).padStart(5, '0')}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Carrera</span>
        <span class="data-value">${carrera}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Modalidad</span>
        <span class="data-value">${modalidad}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Categoría asignada</span>
        <span class="data-value">${categoria}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Fecha del evento</span>
        <span class="data-value">${fechaEvento}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Ubicación</span>
        <span class="data-value">${ubicacion || '—'}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Estado</span>
        <span class="data-value">
          <span class="badge badge-approved">✓ APROBADA</span>
        </span>
      </div>
    </div>

    <p>Te esperamos el día del evento. ¡Muchos éxitos y gracias por participar!</p>
    <p><strong>Crono Sports</strong></p>
  `;
  return base(contenido);
}

module.exports = { inscripcionRecibida, inscripcionAprobada };
