const dashboardRepository = require('./dashboard.repository');

async function obtenerResumen() {
  return dashboardRepository.getResumenGeneral();
}

async function obtenerInscripcionesPorCarrera() {
  return dashboardRepository.getInscripcionesPorCarrera();
}

async function obtenerInscripcionesPorFecha() {
  return dashboardRepository.getInscripcionesPorFecha();
}

async function obtenerInscripcionesPorCategoria() {
  return dashboardRepository.getInscripcionesPorCategoria();
}

async function obtenerInscripcionesPorSexo() {
  return dashboardRepository.getInscripcionesPorSexo();
}

async function obtenerInscripcionesPorModalidad() {
  return dashboardRepository.getInscripcionesPorModalidad();
}

async function obtenerEvolucionInscripciones() {
  return dashboardRepository.getEvolucionInscripciones();
}

module.exports = {
  obtenerResumen,
  obtenerInscripcionesPorCarrera,
  obtenerInscripcionesPorFecha,
  obtenerInscripcionesPorCategoria,
  obtenerInscripcionesPorSexo,
  obtenerInscripcionesPorModalidad,
  obtenerEvolucionInscripciones
};
