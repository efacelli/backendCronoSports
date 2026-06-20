const fs   = require('fs');
const path = require('path');
const inscripcionesRepository = require('./inscripciones.repository');
const carrerasRepository      = require('../carreras/carreras.repository');
const modalidadesRepository   = require('../modalidades/modalidades.repository');
const calcularEdad             = require('../../utils/calcularEdad');
const calcularCategoria        = require('../../utils/calcularCategoria');
const { notificarInscripcion } = require('../emails/emails.service');

const SEXOS_VALIDOS   = ['masculino', 'femenino', 'otro'];
const ESTADOS_VALIDOS = ['Pendiente', 'Aprobado', 'Rechazado'];

function validarDatos(data) {
  const errores = [];
  if (!data.id_carrera)        errores.push('"id_carrera" es obligatorio');
  if (!data.apellido?.trim())  errores.push('"apellido" es obligatorio');
  if (!data.nombre?.trim())    errores.push('"nombre" es obligatorio');
  if (!data.dni?.trim())       errores.push('"dni" es obligatorio');
  else if (!/^[0-9A-Za-z.-]{5,20}$/.test(data.dni.trim()))
    errores.push('Formato de DNI inválido');
  if (!data.fecha_nacimiento)  errores.push('"fecha_nacimiento" es obligatorio');
  else if (new Date(data.fecha_nacimiento) > new Date())
    errores.push('La fecha de nacimiento no puede ser futura');
  if (!data.sexo)              errores.push('"sexo" es obligatorio');
  if (data.sexo && !SEXOS_VALIDOS.includes(data.sexo))
    errores.push(`"sexo" debe ser: ${SEXOS_VALIDOS.join(', ')}`);
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errores.push('Formato de email inválido');
  return errores;
}

async function registrar(data) {
  const errores = validarDatos(data);
  if (errores.length > 0) {
    const e = new Error(errores.join('. ')); e.statusCode = 400; throw e;
  }

  const carrera = await carrerasRepository.findById(data.id_carrera);
  if (!carrera) {
    const e = new Error('Carrera no encontrada'); e.statusCode = 404; throw e;
  }
  if (carrera.estado !== 'activa') {
    const e = new Error('Las inscripciones para esta carrera no están disponibles');
    e.statusCode = 400; throw e;
  }

  const inscriptosActivos = await carrerasRepository.countInscripcionesActivas(data.id_carrera);
  if (carrera.cupo_maximo > 0 && inscriptosActivos >= carrera.cupo_maximo) {
    const e = new Error('No hay cupos disponibles'); e.statusCode = 409; throw e;
  }

  const yaInscripto = await inscripcionesRepository.existeInscripcion(data.dni, data.id_carrera);
  if (yaInscripto) {
    const e = new Error('Ya existe una inscripción con este DNI para esta carrera');
    e.statusCode = 409; throw e;
  }

  const edad       = calcularEdad(data.fecha_nacimiento);
  const modalidades = await modalidadesRepository.findByCarrera(data.id_carrera);

  let modalidadAsignada;

  if (data.id_modalidad) {
    // El usuario eligió la modalidad explícitamente — verificar que exista en esta carrera
    modalidadAsignada = modalidades.find((m) => String(m.id) === String(data.id_modalidad));
    if (!modalidadAsignada) {
      const e = new Error('La modalidad seleccionada no pertenece a esta carrera');
      e.statusCode = 400; throw e;
    }
  } else {
    // Cálculo automático por edad y sexo
    modalidadAsignada = calcularCategoria(modalidades, edad, data.sexo);
    if (!modalidadAsignada) {
      const e = new Error('No existe modalidad compatible con la edad y sexo ingresados');
      e.statusCode = 400; throw e;
    }
  }

  const nueva = await inscripcionesRepository.create({
    id_carrera:      data.id_carrera,
    id_modalidad:    modalidadAsignada.id,
    apellido:        data.apellido.trim(),
    nombre:          data.nombre.trim(),
    nombre_completo: `${data.apellido.trim()}, ${data.nombre.trim()}`,
    dni:             data.dni.trim(),
    fecha_nacimiento: data.fecha_nacimiento,
    sexo:            data.sexo,
    email:           data.email?.trim() || null,
    telefono:        data.telefono?.trim() || null,
    ciudad:          data.ciudad?.trim() || null,
    observaciones:   data.observaciones?.trim() || null,
    edad,
    categoria:       modalidadAsignada.nombre,
    comprobante:     null,
    estado_pago:     'Pendiente'
  });

  // Enviar email de confirmación (no bloquea ni tira error si falla)
  if (nueva.email) {
    setImmediate(() =>
      notificarInscripcion({
        ...nueva,
        carrera_nombre:   carrera.nombre,
        modalidad_nombre: modalidadAsignada.nombre
      })
    );
  }

  return nueva;
}

async function listar(filtros) {
  return inscripcionesRepository.findAll(filtros);
}

async function obtenerPorId(id) {
  const insc = await inscripcionesRepository.findById(id);
  if (!insc) {
    const e = new Error('Inscripción no encontrada'); e.statusCode = 404; throw e;
  }
  return insc;
}

async function subirComprobante(id, file) {
  if (!file) {
    const e = new Error('Debe adjuntar un comprobante'); e.statusCode = 400; throw e;
  }
  const insc = await inscripcionesRepository.findById(id);
  if (!insc) {
    fs.unlink(file.path, () => {});
    const e = new Error('Inscripción no encontrada'); e.statusCode = 404; throw e;
  }
  const rutaRelativa = path.join('comprobantes', file.filename).replace(/\\/g, '/');
  if (insc.comprobante) {
    const ant = path.join(__dirname, '..', '..', '..', 'uploads', insc.comprobante);
    fs.unlink(ant, () => {});
  }
  return inscripcionesRepository.actualizarComprobante(id, rutaRelativa);
}

async function actualizarEstadoPago(id, estado) {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    const e = new Error(`Estado debe ser: ${ESTADOS_VALIDOS.join(', ')}`);
    e.statusCode = 400; throw e;
  }
  const insc = await inscripcionesRepository.actualizarEstadoPago(id, estado);
  if (!insc) {
    const e = new Error('Inscripción no encontrada'); e.statusCode = 404; throw e;
  }
  return insc;
}

module.exports = { registrar, listar, obtenerPorId, subirComprobante, actualizarEstadoPago };
