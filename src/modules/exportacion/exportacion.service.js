const ExcelJS = require('exceljs');
const inscripcionesRepository = require('../inscripciones/inscripciones.repository');
const db = require('../../config/db');

// ─── Paleta de colores corporativa ───────────────────────────────────────────
const COLOR = {
  navyFill:   { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10243E' } },
  coralFill:  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF5A3C' } },
  sandFill:   { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5EFE4' } },
  greenFill:  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3FA66B' } },
  warnFill:   { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0A526' } },
  dangerFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6452C' } },
  whiteFill:  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
  rowAltFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F7F4' } },
};

const FONT = {
  white:      { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
  whiteTitle: { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 22 },
  whiteSub:   { name: 'Calibri', bold: false, color: { argb: 'FFCCD8E8' }, size: 12 },
  navy:       { name: 'Calibri', bold: true, color: { argb: 'FF10243E' }, size: 11 },
  navyBig:    { name: 'Calibri', bold: true, color: { argb: 'FF10243E' }, size: 14 },
  coral:      { name: 'Calibri', bold: true, color: { argb: 'FFFF5A3C' }, size: 11 },
  stat:       { name: 'Calibri', bold: true, color: { argb: 'FF10243E' }, size: 28 },
  statLabel:  { name: 'Calibri', bold: false, color: { argb: 'FF6B7785' }, size: 10 },
  normal:     { name: 'Calibri', bold: false, color: { argb: 'FF0B1626' }, size: 10 },
  mono:       { name: 'Courier New', bold: false, color: { argb: 'FF0B1626' }, size: 10 },
};

const BORDER_THIN = {
  top:    { style: 'thin',   color: { argb: 'FFE2DDD6' } },
  left:   { style: 'thin',   color: { argb: 'FFE2DDD6' } },
  bottom: { style: 'thin',   color: { argb: 'FFE2DDD6' } },
  right:  { style: 'thin',   color: { argb: 'FFE2DDD6' } },
};

const BORDER_MEDIUM = {
  top:    { style: 'medium', color: { argb: 'FF10243E' } },
  left:   { style: 'medium', color: { argb: 'FF10243E' } },
  bottom: { style: 'medium', color: { argb: 'FF10243E' } },
  right:  { style: 'medium', color: { argb: 'FF10243E' } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtFecha(v) {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? '' : d.toLocaleDateString('es-AR', { timeZone: 'UTC' });
}

function fmtFechaHora(v) {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? '' : d.toLocaleString('es-AR');
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function setBorderRange(sheet, startRow, endRow, startCol, endCol, border) {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = sheet.getCell(r, c);
      cell.border = border;
    }
  }
}

// ─── Hoja 1: Portada ──────────────────────────────────────────────────────────
function crearPortada(workbook, resumen, filtros) {
  const sheet = workbook.addWorksheet('Portada', {
    properties: { tabColor: { argb: 'FF10243E' } }
  });

  sheet.getColumn(1).width = 6;
  sheet.getColumn(2).width = 40;
  sheet.getColumn(3).width = 22;
  sheet.getColumn(4).width = 22;
  sheet.getColumn(5).width = 6;

  // Bloque de color superior (filas 1-12)
  for (let r = 1; r <= 12; r++) {
    for (let c = 1; c <= 5; c++) {
      sheet.getCell(r, c).fill = COLOR.navyFill;
    }
  }

  // Titulo
  sheet.mergeCells('B3:D3');
  const titulo = sheet.getCell('B3');
  titulo.value = 'CronoSports 2026';
  titulo.font = FONT.whiteTitle;
  titulo.alignment = { horizontal: 'left', vertical: 'middle' };

  sheet.mergeCells('B4:D4');
  const subtitulo = sheet.getCell('B4');
  subtitulo.value = 'Reporte de Inscriptos Aprobados';
  subtitulo.font = FONT.whiteSub;
  subtitulo.alignment = { horizontal: 'left', vertical: 'middle' };

  // Linea coral decorativa
  for (let c = 2; c <= 4; c++) {
    sheet.getCell(6, c).fill = COLOR.coralFill;
  }
  sheet.getRow(6).height = 3;

  // Fecha de generacion
  sheet.mergeCells('B8:D8');
  const fechaGen = sheet.getCell('B8');
  fechaGen.value = `Generado el ${fmtFechaHora(new Date())}`;
  fechaGen.font = { ...FONT.whiteSub, size: 10 };
  fechaGen.alignment = { horizontal: 'left' };

  if (filtros.id_carrera) {
    sheet.mergeCells('B9:D9');
    const filtroLabel = sheet.getCell('B9');
    filtroLabel.value = `Filtrado por carrera ID: ${filtros.id_carrera}`;
    filtroLabel.font = { ...FONT.whiteSub, size: 10, italic: true };
    filtroLabel.alignment = { horizontal: 'left' };
  }

  // ── Cuadros de estadísticas (fila 14-20) ──
  const stats = [
    { label: 'Total inscriptos', value: resumen.total_inscripciones, col: 'B', fill: COLOR.sandFill,   font: FONT.stat },
    { label: 'Aprobados',        value: resumen.pagos_aprobados,     col: 'C', fill: COLOR.greenFill,  font: { ...FONT.stat, color: { argb: 'FFFFFFFF' } } },
    { label: 'Pendientes',       value: resumen.pagos_pendientes,    col: 'D', fill: COLOR.warnFill,   font: { ...FONT.stat, color: { argb: 'FFFFFFFF' } } },
  ];

  sheet.getRow(14).height = 14;

  stats.forEach(({ label, value, col, fill, font }) => {
    sheet.mergeCells(`${col}15:${col}17`);
    const vCell = sheet.getCell(`${col}15`);
    vCell.value = value ?? 0;
    vCell.font = font;
    vCell.fill = fill;
    vCell.alignment = { horizontal: 'center', vertical: 'middle' };
    vCell.border = BORDER_MEDIUM;

    const lCell = sheet.getCell(`${col}18`);
    lCell.value = label.toUpperCase();
    lCell.font = FONT.statLabel;
    lCell.alignment = { horizontal: 'center' };
  });

  // ── Rechazados aparte ──
  sheet.mergeCells('B20:D20');
  const rechLabel = sheet.getCell('B20');
  rechLabel.value = `Inscripciones rechazadas: ${resumen.pagos_rechazados ?? 0}   |   Carreras activas: ${resumen.carreras_activas ?? 0} de ${resumen.total_carreras ?? 0}`;
  rechLabel.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF6B7785' } };
  rechLabel.alignment = { horizontal: 'center' };

  // ── Nota al pie ──
  sheet.mergeCells('B24:D24');
  const nota = sheet.getCell('B24');
  nota.value = 'Este documento contiene información confidencial. Solo inscriptos con pago APROBADO.';
  nota.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF9AABBF' } };
  nota.alignment = { horizontal: 'center' };

  sheet.views = [{ showGridLines: false }];
}

// ─── Hoja 2: Inscriptos Aprobados ─────────────────────────────────────────────
function crearHojaInscriptos(workbook, inscripciones) {
  const sheet = workbook.addWorksheet('Inscriptos Aprobados', {
    properties: { tabColor: { argb: 'FF3FA66B' } },
    views: [{ state: 'frozen', ySplit: 3 }]
  });

  const cols = [
    { key: 'id',           width: 8  },
    { key: 'apellido',     width: 22 },
    { key: 'nombre',       width: 22 },
    { key: 'dni',          width: 14 },
    { key: 'nacimiento',   width: 16 },
    { key: 'edad',         width: 8  },
    { key: 'sexo',         width: 14 },
    { key: 'email',        width: 26 },
    { key: 'telefono',     width: 16 },
    { key: 'ciudad',       width: 18 },
    { key: 'carrera',      width: 28 },
    { key: 'modalidad',    width: 22 },
    { key: 'categoria',    width: 22 },
    { key: 'estado',       width: 14 },
    { key: 'inscripto_el', width: 20 },
  ];

  cols.forEach((col, i) => { sheet.getColumn(i + 1).width = col.width; });

  sheet.mergeCells('A1:O1');
  const tituloCell = sheet.getCell('A1');
  tituloCell.value = 'INSCRIPTOS APROBADOS — CRONO SPORTS';
  tituloCell.font = FONT.white;
  tituloCell.fill = COLOR.navyFill;
  tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 24;

  const subHeaders = [
    '#ID', 'Apellido', 'Nombre', 'DNI', 'Fecha nac.', 'Edad', 'Sexo',
    'Email', 'Teléfono', 'Ciudad', 'Carrera', 'Modalidad', 'Categoría', 'Estado', 'Inscripto el'
  ];
  subHeaders.forEach((label, i) => {
    const cell = sheet.getCell(2, i + 1);
    cell.value = label;
    cell.font = FONT.white;
    cell.fill = COLOR.coralFill;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDER_THIN;
  });
  sheet.getRow(2).height = 20;

  inscripciones.forEach((insc, idx) => {
    const rowNum = idx + 3;
    const isAlt  = idx % 2 === 1;

    const values = [
      `#${String(insc.id).padStart(5, '0')}`,
      insc.apellido || '',
      insc.nombre   || '',
      insc.dni,
      fmtFecha(insc.fecha_nacimiento),
      insc.edad,
      capitalize(insc.sexo),
      insc.email    || '—',
      insc.telefono || '—',
      insc.ciudad   || '—',
      insc.carrera_nombre,
      insc.modalidad_nombre,
      insc.categoria,
      insc.estado_pago,
      fmtFechaHora(insc.fecha_inscripcion),
    ];

    const rowFill = isAlt ? COLOR.rowAltFill : COLOR.whiteFill;

    values.forEach((val, c) => {
      const cell = sheet.getCell(rowNum, c + 1);
      cell.value = val;
      cell.fill  = rowFill;
      cell.border = BORDER_THIN;
      if (c === 0) {
        cell.font = FONT.coral; cell.alignment = { horizontal: 'center' };
      } else if (c === 5) {
        cell.font = { ...FONT.mono, bold: true }; cell.alignment = { horizontal: 'center' };
      } else if (c === 4 || c === 14) {
        cell.font = FONT.mono; cell.alignment = { horizontal: 'center' };
      } else if (c === 13) {
        cell.font = { name: 'Calibri', bold: true, color: { argb: 'FF3FA66B' }, size: 10 };
        cell.alignment = { horizontal: 'center' };
      } else {
        cell.font = FONT.normal; cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }
    });
    sheet.getRow(rowNum).height = 16;
  });

  if (inscripciones.length > 0) {
    const totalRow = inscripciones.length + 3;
    sheet.mergeCells(`A${totalRow}:E${totalRow}`);
    const totalCell = sheet.getCell(`A${totalRow}`);
    totalCell.value = `Total de inscriptos aprobados: ${inscripciones.length}`;
    totalCell.font  = { ...FONT.navy, size: 10 };
    totalCell.fill  = COLOR.sandFill;
    totalCell.alignment = { horizontal: 'left', vertical: 'middle' };
    totalCell.border = BORDER_MEDIUM;
    sheet.getRow(totalRow).height = 18;
  }

  sheet.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: cols.length } };
}

// ─── Hoja 3: Resumen por Carrera ──────────────────────────────────────────────
async function crearHojaResumenCarrera(workbook) {
  const result = await db.query(`
    SELECT
      c.nombre AS carrera,
      c.tipo,
      c.fecha_evento,
      c.cupo_maximo,
      COUNT(i.id)::int AS total,
      COUNT(i.id) FILTER (WHERE i.estado_pago = 'Aprobado')::int AS aprobados,
      COUNT(i.id) FILTER (WHERE i.estado_pago = 'Pendiente')::int AS pendientes,
      COUNT(i.id) FILTER (WHERE i.estado_pago = 'Rechazado')::int AS rechazados,
      ROUND(
        CASE WHEN COUNT(i.id) > 0
          THEN COUNT(i.id) FILTER (WHERE i.estado_pago = 'Aprobado')::numeric * 100 / COUNT(i.id)
          ELSE 0
        END, 1
      ) AS pct_aprobados
    FROM carreras c
    LEFT JOIN inscripciones i ON i.id_carrera = c.id
    GROUP BY c.id, c.nombre, c.tipo, c.fecha_evento, c.cupo_maximo
    ORDER BY c.fecha_evento ASC
  `);

  const sheet = workbook.addWorksheet('Resumen por Carrera', {
    properties: { tabColor: { argb: 'FFFF5A3C' } }
  });

  const headers = ['Carrera', 'Tipo', 'Fecha evento', 'Cupo máx.', 'Total inscr.', 'Aprobados', 'Pendientes', 'Rechazados', '% Aprobación'];
  const widths  = [34, 14, 14, 12, 14, 12, 12, 12, 16];

  headers.forEach((h, i) => {
    sheet.getColumn(i + 1).width = widths[i];
    const cell = sheet.getCell(1, i + 1);
    cell.value = h;
    cell.font = FONT.white;
    cell.fill = COLOR.navyFill;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDER_THIN;
  });
  sheet.getRow(1).height = 22;

  result.rows.forEach((row, idx) => {
    const r = idx + 2;
    const isAlt = idx % 2 === 1;
    const fill = isAlt ? COLOR.rowAltFill : COLOR.whiteFill;

    const values = [
      row.carrera,
      capitalize(row.tipo),
      fmtFecha(row.fecha_evento),
      row.cupo_maximo || 'Ilimitado',
      row.total,
      row.aprobados,
      row.pendientes,
      row.rechazados,
      `${row.pct_aprobados}%`,
    ];

    values.forEach((val, c) => {
      const cell = sheet.getCell(r, c + 1);
      cell.value = val;
      cell.fill = fill;
      cell.border = BORDER_THIN;
      cell.font = FONT.normal;

      if (c === 5) cell.font = { ...FONT.normal, bold: true, color: { argb: 'FF3FA66B' } };
      if (c === 6) cell.font = { ...FONT.normal, color: { argb: 'FFE0A526' } };
      if (c === 7) cell.font = { ...FONT.normal, color: { argb: 'FFD6452C' } };
      if ([2,3,4,5,6,7].includes(c)) cell.alignment = { horizontal: 'center' };
    });
    sheet.getRow(r).height = 16;
  });

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

// ─── Hoja 4: Resumen por Modalidad ────────────────────────────────────────────
async function crearHojaResumenModalidad(workbook) {
  const result = await db.query(`
    SELECT
      c.nombre AS carrera,
      m.nombre AS modalidad,
      m.distancia,
      m.sexo,
      m.edad_minima,
      m.edad_maxima,
      COUNT(i.id)::int AS total,
      COUNT(i.id) FILTER (WHERE i.estado_pago = 'Aprobado')::int AS aprobados,
      COUNT(i.id) FILTER (WHERE i.estado_pago = 'Pendiente')::int AS pendientes
    FROM modalidades m
    JOIN carreras c ON c.id = m.id_carrera
    LEFT JOIN inscripciones i ON i.id_modalidad = m.id
    GROUP BY m.id, m.nombre, m.distancia, m.sexo, m.edad_minima, m.edad_maxima, c.nombre
    ORDER BY c.nombre, total DESC
  `);

  const sheet = workbook.addWorksheet('Resumen por Modalidad', {
    properties: { tabColor: { argb: 'FF3FA66B' } }
  });

  const headers = ['Carrera', 'Modalidad', 'Distancia', 'Sexo', 'Edad mín.', 'Edad máx.', 'Total', 'Aprobados', 'Pendientes'];
  const widths  = [30, 28, 12, 12, 10, 10, 10, 12, 12];

  headers.forEach((h, i) => {
    sheet.getColumn(i + 1).width = widths[i];
    const cell = sheet.getCell(1, i + 1);
    cell.value = h;
    cell.font = FONT.white;
    cell.fill = COLOR.coralFill;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDER_THIN;
  });
  sheet.getRow(1).height = 22;

  result.rows.forEach((row, idx) => {
    const r = idx + 2;
    const fill = idx % 2 === 1 ? COLOR.rowAltFill : COLOR.whiteFill;
    const values = [
      row.carrera, row.modalidad, row.distancia || '—',
      capitalize(row.sexo), row.edad_minima, row.edad_maxima,
      row.total, row.aprobados, row.pendientes
    ];
    values.forEach((val, c) => {
      const cell = sheet.getCell(r, c + 1);
      cell.value = val;
      cell.fill = fill;
      cell.border = BORDER_THIN;
      cell.font = c === 7 ? { ...FONT.normal, bold: true, color: { argb: 'FF3FA66B' } } : FONT.normal;
      if (c >= 4) cell.alignment = { horizontal: 'center' };
    });
    sheet.getRow(r).height = 16;
  });

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

// ─── Hoja 5: Distribución por Sexo ────────────────────────────────────────────
async function crearHojaDistribucionSexo(workbook) {
  const result = await db.query(`
    SELECT sexo, COUNT(*)::int AS total,
      ROUND(COUNT(*)::numeric * 100 / SUM(COUNT(*)) OVER (), 1) AS porcentaje
    FROM inscripciones
    GROUP BY sexo ORDER BY total DESC
  `);

  const sheet = workbook.addWorksheet('Distribución por Sexo', {
    properties: { tabColor: { argb: 'FF6B7785' } }
  });

  sheet.getColumn(1).width = 20;
  sheet.getColumn(2).width = 16;
  sheet.getColumn(3).width = 16;
  sheet.getColumn(4).width = 28;

  // Título
  sheet.mergeCells('A1:D1');
  const t = sheet.getCell('A1');
  t.value = 'DISTRIBUCIÓN POR SEXO';
  t.font = FONT.white; t.fill = COLOR.navyFill;
  t.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 22;

  ['Sexo', 'Total', 'Porcentaje', 'Representación visual'].forEach((h, i) => {
    const cell = sheet.getCell(2, i + 1);
    cell.value = h;
    cell.font = FONT.white; cell.fill = COLOR.coralFill;
    cell.alignment = { horizontal: 'center' }; cell.border = BORDER_THIN;
  });
  sheet.getRow(2).height = 18;

  const colors = ['FF10243E', 'FFFF5A3C', 'FF6B7785'];

  result.rows.forEach((row, idx) => {
    const r = idx + 3;
    const pct = parseFloat(row.porcentaje);
    const barLen = Math.max(1, Math.round(pct / 4)); // max ~25 chars
    const bar = '█'.repeat(barLen) + `  ${pct}%`;

    [capitalize(row.sexo), row.total, `${pct}%`, bar].forEach((val, c) => {
      const cell = sheet.getCell(r, c + 1);
      cell.value = val;
      cell.border = BORDER_THIN;
      cell.fill = COLOR.whiteFill;
      if (c === 3) {
        cell.font = { name: 'Courier New', bold: true, color: { argb: colors[idx] || 'FF6B7785' }, size: 10 };
      } else if (c === 1) {
        cell.font = { ...FONT.navy, size: 14 };
        cell.alignment = { horizontal: 'center' };
      } else {
        cell.font = FONT.normal;
        cell.alignment = { horizontal: 'center' };
      }
    });
    sheet.getRow(r).height = 18;
  });
}

// ─── Hoja 6: Distribución por Categoría ───────────────────────────────────────
async function crearHojaDistribucionCategoria(workbook) {
  const result = await db.query(`
    SELECT categoria,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE estado_pago = 'Aprobado')::int AS aprobados,
      COUNT(*) FILTER (WHERE sexo = 'masculino')::int AS masculino,
      COUNT(*) FILTER (WHERE sexo = 'femenino')::int AS femenino,
      ROUND(COUNT(*)::numeric * 100 / SUM(COUNT(*)) OVER (), 1) AS porcentaje
    FROM inscripciones
    GROUP BY categoria ORDER BY total DESC
  `);

  const sheet = workbook.addWorksheet('Distribución por Categoría', {
    properties: { tabColor: { argb: 'FFFF5A3C' } }
  });

  const headers = ['Categoría', 'Total', 'Aprobados', 'Masculino', 'Femenino', '% del total', 'Barra'];
  const widths  = [28, 10, 12, 12, 12, 14, 30];

  headers.forEach((h, i) => {
  sheet.getColumn(i + 1).width = widths[i];
});

sheet.mergeCells('A1:G1');

  const titulo = sheet.getCell('A1');
  titulo.value = 'DISTRIBUCIÓN POR CATEGORÍA';
  titulo.font = FONT.white; titulo.fill = COLOR.navyFill;
  titulo.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 22;

  headers.forEach((h, i) => {
    const cell = sheet.getCell(2, i + 1);
    cell.value = h;
    cell.font = FONT.white; cell.fill = COLOR.coralFill;
    cell.alignment = { horizontal: 'center' }; cell.border = BORDER_THIN;
  });
  sheet.getRow(2).height = 18;

  result.rows.forEach((row, idx) => {
    const r = idx + 3;
    const pct = parseFloat(row.porcentaje);
    const barLen = Math.max(1, Math.round(pct / 2));
    const bar = '█'.repeat(barLen) + `  ${pct}%`;
    const fill = idx % 2 === 1 ? COLOR.rowAltFill : COLOR.whiteFill;

    const values = [row.categoria, row.total, row.aprobados, row.masculino, row.femenino, `${pct}%`, bar];

    values.forEach((val, c) => {
      const cell = sheet.getCell(r, c + 1);
      cell.value = val;
      cell.fill = fill; cell.border = BORDER_THIN;
      if (c === 6) {
        cell.font = { name: 'Courier New', bold: true, color: { argb: 'FFFF5A3C' }, size: 9 };
      } else if (c === 2) {
        cell.font = { ...FONT.normal, bold: true, color: { argb: 'FF3FA66B' } };
        cell.alignment = { horizontal: 'center' };
      } else {
        cell.font = FONT.normal;
        if (c > 0) cell.alignment = { horizontal: 'center' };
      }
    });
    sheet.getRow(r).height = 16;
  });

  sheet.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: headers.length } };
  sheet.views = [{ state: 'frozen', ySplit: 2 }];
}

// ─── Funcion principal exportada ──────────────────────────────────────────────
async function generarExcelInscriptosAprobados(filtros = {}) {
  // Carga paralela de datos
  const [inscripciones, resumenResult] = await Promise.all([
    inscripcionesRepository.findAprobadasParaExport(filtros),
    db.query(`
      SELECT
        (SELECT COUNT(*)::int FROM carreras) AS total_carreras,
        (SELECT COUNT(*)::int FROM carreras WHERE estado = 'activa') AS carreras_activas,
        (SELECT COUNT(*)::int FROM inscripciones) AS total_inscripciones,
        (SELECT COUNT(*)::int FROM inscripciones WHERE estado_pago = 'Pendiente') AS pagos_pendientes,
        (SELECT COUNT(*)::int FROM inscripciones WHERE estado_pago = 'Aprobado') AS pagos_aprobados,
        (SELECT COUNT(*)::int FROM inscripciones WHERE estado_pago = 'Rechazado') AS pagos_rechazados
    `)
  ]);

  const resumen = resumenResult.rows[0];

  const workbook = new ExcelJS.Workbook();
  workbook.creator   = 'Circuito Sur — Plataforma de Inscripciones';
  workbook.lastModifiedBy = 'Sistema';
  workbook.created   = new Date();
  workbook.modified  = new Date();
  workbook.properties.date1904 = false;

  // Construir hojas en orden
  crearPortada(workbook, resumen, filtros);
  crearHojaInscriptos(workbook, inscripciones);
  await crearHojaResumenCarrera(workbook);
  await crearHojaResumenModalidad(workbook);
  await crearHojaDistribucionSexo(workbook);
  await crearHojaDistribucionCategoria(workbook);

  return workbook;
}

module.exports = { generarExcelInscriptosAprobados };
