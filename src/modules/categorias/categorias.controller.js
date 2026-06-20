const svc = require('./categorias.service');

const listar       = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.listar() }); } catch (e) { next(e); }
};
const obtener      = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.obtenerPorId(req.params.id) }); } catch (e) { next(e); }
};
const porCarrera   = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.obtenerPorCarrera(req.params.idCarrera) }); } catch (e) { next(e); }
};
const crear        = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await svc.crear(req.body) }); } catch (e) { next(e); }
};
const actualizar   = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.actualizar(req.params.id, req.body) }); } catch (e) { next(e); }
};
const eliminar     = async (req, res, next) => {
  try { await svc.eliminar(req.params.id); res.json({ success: true }); } catch (e) { next(e); }
};
const estandar     = async (req, res, next) => {
  try {
    const creadas = await svc.generarEstandar();
    res.json({ success: true, message: `${creadas.length} categorías estándar creadas`, data: creadas });
  } catch (e) { next(e); }
};
const asignar      = async (req, res, next) => {
  try {
    await svc.asignarACarrera(req.params.idCarrera, req.params.idCategoria);
    res.json({ success: true });
  } catch (e) { next(e); }
};
const desasignar   = async (req, res, next) => {
  try {
    await svc.desasignarDeCarrera(req.params.idCarrera, req.params.idCategoria);
    res.json({ success: true });
  } catch (e) { next(e); }
};
const reemplazar   = async (req, res, next) => {
  try {
    await svc.reemplazarCategoriasDeCarrera(req.params.idCarrera, req.body.ids || []);
    res.json({ success: true });
  } catch (e) { next(e); }
};

module.exports = {
  listar, obtener, porCarrera, crear, actualizar, eliminar,
  estandar, asignar, desasignar, reemplazar
};
