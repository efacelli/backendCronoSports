const express = require('express');
const cors    = require('cors');
const path    = require('path');

const env          = require('./config/env');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes          = require('./modules/auth/auth.routes');
const carrerasRoutes      = require('./modules/carreras/carreras.routes');
const modalidadesRoutes   = require('./modules/modalidades/modalidades.routes');
const inscripcionesRoutes = require('./modules/inscripciones/inscripciones.routes');
const pagosRoutes         = require('./modules/pagos/pagos.routes');
const dashboardRoutes     = require('./modules/dashboard/dashboard.routes');
const exportacionRoutes   = require('./modules/exportacion/exportacion.routes');
const categoriasRoutes    = require('./modules/categorias/categorias.routes');
const emailsRoutes        = require('./modules/emails/emails.routes');

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === 'development') {
  app.use((req, res, next) => { console.log(`${req.method} ${req.originalUrl}`); next(); });
}

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'API funcionando correctamente' })
);

app.use('/api/auth',         authRoutes);
app.use('/api/carreras',     carrerasRoutes);
app.use('/api/modalidades',  modalidadesRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/pagos',        pagosRoutes);
app.use('/api/dashboard',    dashboardRoutes);
app.use('/api/export',       exportacionRoutes);
app.use('/api/categorias',   categoriasRoutes);
app.use('/api/emails',       emailsRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Recurso no encontrado' }));
app.use(errorHandler);

module.exports = app;
