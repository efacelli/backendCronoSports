/**
 * Determina, entre un listado de modalidades de una carrera,
 * cual corresponde a un participante segun su edad y sexo.
 *
 * Reglas de coincidencia:
 *  - El sexo de la modalidad debe ser 'otro' (libre/mixto) o coincidir
 *    exactamente con el sexo del participante.
 *  - La edad del participante debe estar dentro de [edad_minima, edad_maxima].
 *
 * Si hay varias modalidades que matchean, se prioriza la que tenga
 * coincidencia exacta de sexo sobre la libre ('otro').
 *
 * @param {Array<Object>} modalidades - Lista de modalidades de la carrera
 * @param {number} edad - Edad del participante
 * @param {string} sexo - 'masculino' | 'femenino' | 'otro'
 * @returns {Object|null} La modalidad encontrada o null si no hay coincidencias
 */
function calcularCategoria(modalidades, edad, sexo) {
  if (!Array.isArray(modalidades) || modalidades.length === 0) {
    return null;
  }

  const candidatas = modalidades.filter((m) => {
    const sexoCompatible = m.sexo === 'otro' || m.sexo === sexo;
    const edadCompatible = edad >= m.edad_minima && edad <= m.edad_maxima;
    return sexoCompatible && edadCompatible;
  });

  if (candidatas.length === 0) {
    return null;
  }

  // Prioriza coincidencia exacta de sexo sobre modalidades mixtas/libres
  const exacta = candidatas.find((m) => m.sexo === sexo);
  return exacta || candidatas[0];
}

module.exports = calcularCategoria;
