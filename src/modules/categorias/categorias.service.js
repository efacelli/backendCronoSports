const repo = require('./categorias.repository');

const SEXOS = ['masculino', 'femenino', 'otro'];

function validar(data, { esCreacion }) {
  const errores = [];
  if (esCreacion && !data.nombre?.trim()) errores.push('"nombre" es obligatorio');
  if (data.sexo !== undefined && !SEXOS.includes(data.sexo))
    errores.push(`"sexo" debe ser: ${SEXOS.join(', ')}`);
  const min = Number(data.edad_minima);
  const max = Number(data.edad_maxima);
  if (!isNaN(min) && !isNaN(max) && min > max)
    errores.push('"edad_minima" no puede ser mayor que "edad_maxima"');
  if (!isNaN(min) && min < 0)
    errores.push('"edad_minima" no puede ser negativa');
  return errores;
}

async function listar() { return repo.findAll(); }

async function obtenerPorId(id) {
  const cat = await repo.findById(id);
  if (!cat) { const e = new Error('Categoría no encontrada'); e.statusCode = 404; throw e; }
  return cat;
}

async function obtenerPorCarrera(idCarrera) {
  return repo.findByCarrera(idCarrera);
}

async function crear(data) {
  const errores = validar(data, { esCreacion: true });
  if (errores.length) { const e = new Error(errores.join('. ')); e.statusCode = 400; throw e; }

  const superposicion = await repo.existeSuperposicion({
    sexo: data.sexo || 'otro',
    edad_minima: Number(data.edad_minima),
    edad_maxima: Number(data.edad_maxima)
  });
  if (superposicion) {
    const e = new Error('Ya existe una categoría con rango de edad superpuesto para ese sexo');
    e.statusCode = 409; throw e;
  }

  return repo.create(data);
}

async function actualizar(id, data) {
  const errores = validar(data, { esCreacion: false });
  if (errores.length) { const e = new Error(errores.join('. ')); e.statusCode = 400; throw e; }

  if (data.edad_minima !== undefined || data.edad_maxima !== undefined) {
    const actual = await repo.findById(id);
    if (!actual) { const e = new Error('Categoría no encontrada'); e.statusCode = 404; throw e; }

    const min = data.edad_minima !== undefined ? Number(data.edad_minima) : actual.edad_minima;
    const max = data.edad_maxima !== undefined ? Number(data.edad_maxima) : actual.edad_maxima;
    const sexo = data.sexo || actual.sexo;

    const sup = await repo.existeSuperposicion({ sexo, edad_minima: min, edad_maxima: max, excludeId: id });
    if (sup) {
      const e = new Error('Ya existe una categoría con rango de edad superpuesto para ese sexo');
      e.statusCode = 409; throw e;
    }
  }

  const cat = await repo.update(id, data);
  if (!cat) { const e = new Error('Categoría no encontrada'); e.statusCode = 404; throw e; }
  return cat;
}

async function eliminar(id) {
  const cat = await repo.remove(id);
  if (!cat) { const e = new Error('Categoría no encontrada'); e.statusCode = 404; throw e; }
  return cat;
}

async function asignarACarrera(idCarrera, idCategoria) {
  return repo.asignarACarrera(idCarrera, idCategoria);
}

async function desasignarDeCarrera(idCarrera, idCategoria) {
  return repo.desasignarDeCarrera(idCarrera, idCategoria);
}

async function reemplazarCategoriasDeCarrera(idCarrera, ids) {
  return repo.reemplazarCategoriasDeCarrera(idCarrera, ids);
}

async function generarEstandar() {
  return repo.generarEstandar();
}

module.exports = {
  listar, obtenerPorId, obtenerPorCarrera,
  crear, actualizar, eliminar,
  asignarACarrera, desasignarDeCarrera, reemplazarCategoriasDeCarrera,
  generarEstandar
};
