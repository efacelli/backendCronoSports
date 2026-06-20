const db = require('../../config/db');

/**
 * Lista todas las modalidades de una carrera.
 */
async function findByCarrera(idCarrera) {
  const result = await db.query(
    `SELECT id, id_carrera, nombre, distancia, sexo, edad_minima, edad_maxima, precio_extra, created_at
     FROM modalidades
     WHERE id_carrera = $1
     ORDER BY edad_minima ASC, nombre ASC`,
    [idCarrera]
  );

  return result.rows;
}

/**
 * Busca una modalidad por id.
 */
async function findById(id) {
  const result = await db.query(
    `SELECT id, id_carrera, nombre, distancia, sexo, edad_minima, edad_maxima, precio_extra, created_at
     FROM modalidades
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Crea una nueva modalidad asociada a una carrera.
 */
async function create(data) {
  const { id_carrera, nombre, distancia, sexo, edad_minima, edad_maxima, precio_extra } = data;

  const result = await db.query(
    `INSERT INTO modalidades
       (id_carrera, nombre, distancia, sexo, edad_minima, edad_maxima, precio_extra)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, id_carrera, nombre, distancia, sexo, edad_minima, edad_maxima, precio_extra, created_at`,
    [
      id_carrera,
      nombre,
      distancia || null,
      sexo || 'otro',
      edad_minima ?? 0,
      edad_maxima ?? 120,
      precio_extra ?? 0
    ]
  );

  return result.rows[0];
}

/**
 * Actualiza una modalidad existente.
 */
async function update(id, data) {
  const campos = [];
  const valores = [];
  let idx = 1;

  const camposPermitidos = ['nombre', 'distancia', 'sexo', 'edad_minima', 'edad_maxima', 'precio_extra'];

  for (const campo of camposPermitidos) {
    if (data[campo] !== undefined) {
      campos.push(`${campo} = $${idx}`);
      valores.push(data[campo]);
      idx += 1;
    }
  }

  if (campos.length === 0) {
    return findById(id);
  }

  valores.push(id);

  const result = await db.query(
    `UPDATE modalidades
     SET ${campos.join(', ')}
     WHERE id = $${idx}
     RETURNING id, id_carrera, nombre, distancia, sexo, edad_minima, edad_maxima, precio_extra, created_at`,
    valores
  );

  return result.rows[0] || null;
}

/**
 * Elimina una modalidad por id.
 */
async function remove(id) {
  const result = await db.query('DELETE FROM modalidades WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
}

module.exports = {
  findByCarrera,
  findById,
  create,
  update,
  remove
};
