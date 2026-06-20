const app = require('./app');
const env = require('./config/env');
const db  = require('./config/db');
const { verificarConexionSMTP } = require('./config/mailer');

async function start() {
  try {
    await db.testConnection();
    await verificarConexionSMTP(); // no bloquea si falla

    app.listen(env.PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
      console.log(`Entorno: ${env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
}

start();
