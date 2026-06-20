const db = require('../../config/db');

async function findAll() {
  const result = await db.query(
    `SELECT id, nombre, edad_minima, edad_maxima, sexo, created_at
     FROM categorias ORDER BY sexo, edad_minima ASC`
  );
  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    'SELECT id, nombre, edad_minima, edad_maxima, sexo, created_at FROM categorias WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function findByCarrera(idCarrera) {
  const result = await db.query(
    `SELECT c.id, c.nombre, c.edad_minima, c.edad_maxima, c.sexo
     FROM categorias c
     JOIN carrera_categorias cc ON cc.id_categoria = c.id
     WHERE cc.id_carrera = $1
     ORDER BY c.sexo, c.edad_minima ASC`,
    [idCarrera]
  );
  return result.rows;
}

/** Verifica superposicion de rangos para el mismo sexo, excluyendo un id opcional */
async function existeSuperposicion({ nombre, edad_minima, edad_maxima, sexo, excludeId = null }) {
  const result = await db.query(
    `SELECT id FROM categorias
     WHERE sexo = $1
       AND edad_minima <= $3
       AND edad_maxima >= $2
       AND ($4::int IS NULL OR id <> $4)`,
    [sexo, edad_minima, edad_maxima, excludeId]
  );
  return result.rows.length > 0;
}

async function create(data) {
  const result = await db.query(
    `INSERT INTO categorias (nombre, edad_minima, edad_maxima, sexo)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nombre, edad_minima, edad_maxima, sexo, created_at`,
    [data.nombre, data.edad_minima, data.edad_maxima, data.sexo || 'otro']
  );
  return result.rows[0];
}

async function update(id, data) {
  const campos = [];
  const valores = [];
  let idx = 1;
  for (const campo of ['nombre', 'edad_minima', 'edad_maxima', 'sexo']) {
    if (data[campo] !== undefined) {
      campos.push(`${campo} = $${idx}`); valores.push(data[campo]); idx++;
    }
  }
  if (campos.length === 0) return findById(id);
  valores.push(id);
  const result = await db.query(
    `UPDATE categorias SET ${campos.join(', ')} WHERE id = $${idx}
     RETURNING id, nombre, edad_minima, edad_maxima, sexo, created_at`,
    valores
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await db.query(
    'DELETE FROM categorias WHERE id = $1 RETURNING id', [id]
  );
  return result.rows[0] || null;
}

async function asignarACarrera(idCarrera, idCategoria) {
  await db.query(
    `INSERT INTO carrera_categorias (id_carrera, id_categoria)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [idCarrera, idCategoria]
  );
}

async function desasignarDeCarrera(idCarrera, idCategoria) {
  await db.query(
    'DELETE FROM carrera_categorias WHERE id_carrera = $1 AND id_categoria = $2',
    [idCarrera, idCategoria]
  );
}

async function reemplazarCategoriasDeCarrera(idCarrera, idsCategoria) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM carrera_categorias WHERE id_carrera = $1', [idCarrera]);
    for (const idCat of idsCategoria) {
      await client.query(
        'INSERT INTO carrera_categorias (id_carrera, id_categoria) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [idCarrera, idCat]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Inserta las 24 categorías estándar si no existen ya */
async function generarEstandar() {
  const estandar = [
    { nombre: 'Menores de 19 (M)', edad_minima: 0,  edad_maxima: 18,  sexo: 'masculino' },
    { nombre: '20-24 (M)',         edad_minima: 20, edad_maxima: 24,  sexo: 'masculino' },
    { nombre: '25-29 (M)',         edad_minima: 25, edad_maxima: 29,  sexo: 'masculino' },
    { nombre: '30-34 (M)',         edad_minima: 30, edad_maxima: 34,  sexo: 'masculino' },
    { nombre: '35-39 (M)',         edad_minima: 35, edad_maxima: 39,  sexo: 'masculino' },
    { nombre: '40-44 (M)',         edad_minima: 40, edad_maxima: 44,  sexo: 'masculino' },
    { nombre: '45-49 (M)',         edad_minima: 45, edad_maxima: 49,  sexo: 'masculino' },
    { nombre: '50-54 (M)',         edad_minima: 50, edad_maxima: 54,  sexo: 'masculino' },
    { nombre: '55-59 (M)',         edad_minima: 55, edad_maxima: 59,  sexo: 'masculino' },
    { nombre: '60-64 (M)',         edad_minima: 60, edad_maxima: 64,  sexo: 'masculino' },
    { nombre: '65-69 (M)',         edad_minima: 65, edad_maxima: 69,  sexo: 'masculino' },
    { nombre: '70+ (M)',           edad_minima: 70, edad_maxima: 120, sexo: 'masculino' },
    { nombre: 'Menores de 19 (F)', edad_minima: 0,  edad_maxima: 18,  sexo: 'femenino'  },
    { nombre: '20-24 (F)',         edad_minima: 20, edad_maxima: 24,  sexo: 'femenino'  },
    { nombre: '25-29 (F)',         edad_minima: 25, edad_maxima: 29,  sexo: 'femenino'  },
    { nombre: '30-34 (F)',         edad_minima: 30, edad_maxima: 34,  sexo: 'femenino'  },
    { nombre: '35-39 (F)',         edad_minima: 35, edad_maxima: 39,  sexo: 'femenino'  },
    { nombre: '40-44 (F)',         edad_minima: 40, edad_maxima: 44,  sexo: 'femenino'  },
    { nombre: '45-49 (F)',         edad_minima: 45, edad_maxima: 49,  sexo: 'femenino'  },
    { nombre: '50-54 (F)',         edad_minima: 50, edad_maxima: 54,  sexo: 'femenino'  },
    { nombre: '55-59 (F)',         edad_minima: 55, edad_maxima: 59,  sexo: 'femenino'  },
    { nombre: '60-64 (F)',         edad_minima: 60, edad_maxima: 64,  sexo: 'femenino'  },
    { nombre: '65-69 (F)',         edad_minima: 65, edad_maxima: 69,  sexo: 'femenino'  },
    { nombre: '70+ (F)',           edad_minima: 70, edad_maxima: 120, sexo: 'femenino'  },
  ];

  const insertadas = [];
  for (const cat of estandar) {
    const existe = await db.query(
      'SELECT id FROM categorias WHERE nombre = $1 AND sexo = $2',
      [cat.nombre, cat.sexo]
    );
    if (existe.rows.length === 0) {
      const r = await create(cat);
      insertadas.push(r);
    }
  }
  return insertadas;
}

module.exports = {
  findAll, findById, findByCarrera, existeSuperposicion,
  create, update, remove,
  asignarACarrera, desasignarDeCarrera, reemplazarCategoriasDeCarrera,
  generarEstandar
};
