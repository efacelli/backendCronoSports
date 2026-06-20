/**
 * Calcula la edad en años a partir de una fecha de nacimiento,
 * tomando como referencia una fecha dada (por defecto, hoy).
 *
 * @param {string|Date} fechaNacimiento - Fecha de nacimiento (YYYY-MM-DD o Date)
 * @param {Date} [fechaReferencia] - Fecha contra la que se calcula la edad
 * @returns {number} Edad en años cumplidos
 */
function calcularEdad(fechaNacimiento, fechaReferencia = new Date()) {
  const nacimiento = new Date(fechaNacimiento);

  if (Number.isNaN(nacimiento.getTime())) {
    throw new Error('Fecha de nacimiento invalida');
  }

  let edad = fechaReferencia.getFullYear() - nacimiento.getFullYear();

  const aunNoCumplio =
    fechaReferencia.getMonth() < nacimiento.getMonth() ||
    (fechaReferencia.getMonth() === nacimiento.getMonth() &&
      fechaReferencia.getDate() < nacimiento.getDate());

  if (aunNoCumplio) {
    edad -= 1;
  }

  return edad;
}

module.exports = calcularEdad;
