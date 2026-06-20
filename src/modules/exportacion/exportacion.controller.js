const exportacionService = require('./exportacion.service');

/**
 * GET /api/export/inscripciones?id_carrera=
 * Protegido [admin]. Genera y descarga un archivo Excel con los
 * inscriptos cuyo estado de pago es "Aprobado".
 */
async function exportarInscriptosAprobados(req, res, next) {
  try {
    const { id_carrera } = req.query;

    const workbook = await exportacionService.generarExcelInscriptosAprobados({ id_carrera });

    const fecha = new Date().toISOString().split('T')[0];
    const filename = `inscriptos_aprobados_${fecha}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    return res.end();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  exportarInscriptosAprobados
};
