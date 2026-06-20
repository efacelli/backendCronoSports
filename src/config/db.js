const { Pool } = require('pg');
const env = require('./env');

/**
 * Pool de conexiones a PostgreSQL.
 * Reutiliza conexiones para evitar el costo de abrir/cerrar
 * una conexion por cada query.
 */
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});
/**
 * Helper para ejecutar queries.
 * @param {string} text - Query SQL con placeholders ($1, $2, ...)
 * @param {Array} params - Parametros de la query
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  if (env.NODE_ENV === 'development') {
    const duration = Date.now() - start;
    console.log('SQL ejecutado', { text, duration, rows: result.rowCount });
  }
  return result;
}

/**
 * Obtiene un cliente del pool para ejecutar transacciones
 * (BEGIN / COMMIT / ROLLBACK).
 */
async function getClient() {
  return pool.connect();
}

/**
 * Verifica la conexion a la base de datos al iniciar el servidor.
 */
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() AS now');
    console.log('Conexion a PostgreSQL exitosa:', result.rows[0].now);
  } catch (err) {
    console.error('No se pudo conectar a PostgreSQL:', err.message);
    throw err;
  }
}

module.exports = {
  pool,
  query,
  getClient,
  testConnection
};
