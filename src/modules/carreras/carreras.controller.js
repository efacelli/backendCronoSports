const svc      = require('./carreras.service');
const catRepo  = require('../categorias/categorias.repository');

async function listar(req, res, next) {
  try {
    const { estado, tipo } = req.query;
    res.json({ success: true, data: await svc.listar({ estado, tipo }) });
  } catch (e) { next(e); }
}

async function listarArchivadas(req, res, next) {
  try {
    res.json({ success: true, data: await svc.listarArchivadas() });
  } catch (e) { next(e); }
}

async function obtener(req, res, next) {
  try {
    res.json({ success: true, data: await svc.obtenerPorId(req.params.id) });
  } catch (e) { next(e); }
}

async function crear(req, res, next) {
  try {
    const carrera = await svc.crear(req.body);
    if (Array.isArray(req.body.categorias_ids) && req.body.categorias_ids.length > 0) {
      await catRepo.reemplazarCategoriasDeCarrera(carrera.id, req.body.categorias_ids);
    }
    res.status(201).json({ success: true, message: 'Carrera creada', data: carrera });
  } catch (e) { next(e); }
}

async function actualizar(req, res, next) {
  try {
    const carrera = await svc.actualizar(req.params.id, req.body);
    if (Array.isArray(req.body.categorias_ids)) {
      await catRepo.reemplazarCategoriasDeCarrera(carrera.id, req.body.categorias_ids);
    }
    res.json({ success: true, message: 'Carrera actualizada', data: carrera });
  } catch (e) { next(e); }
}

async function eliminar(req, res, next) {
  try {
    await svc.eliminar(req.params.id);
    res.json({ success: true, message: 'Carrera eliminada (borrado lógico). Los inscriptos se conservan.' });
  } catch (e) { next(e); }
}

async function archivar(req, res, next) {
  try {
    res.json({ success: true, message: 'Carrera archivada', data: await svc.archivar(req.params.id) });
  } catch (e) { next(e); }
}

async function restaurar(req, res, next) {
  try {
    res.json({ success: true, message: 'Carrera restaurada', data: await svc.restaurar(req.params.id) });
  } catch (e) { next(e); }
}

module.exports = { listar, listarArchivadas, obtener, crear, actualizar, eliminar, archivar, restaurar };
