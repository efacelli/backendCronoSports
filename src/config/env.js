require('dotenv').config();

module.exports = {
  PORT:     process.env.PORT     || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  DATABASE_URL: process.env.DATABASE_URL,

  DB_HOST:     process.env.DB_HOST     || 'localhost',
  DB_PORT:     process.env.DB_PORT     || 5432,
  DB_NAME:     process.env.DB_NAME     || 'running_events_db',
  DB_USER:     process.env.DB_USER     || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DB_SSL:      process.env.DB_SSL === 'true',
  

  JWT_SECRET:     process.env.JWT_SECRET     || 'secret_dev_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',

  FRONTEND_URL:      process.env.FRONTEND_URL      || 'http://localhost:5173',
  UPLOAD_MAX_SIZE_MB: Number(process.env.UPLOAD_MAX_SIZE_MB) || 5,

  // ── SMTP (Nodemailer) ──────────────────────────────────────────────
  SMTP_HOST:     process.env.SMTP_HOST     || '',
  SMTP_PORT:     process.env.SMTP_PORT     || 587,
  SMTP_USER:     process.env.SMTP_USER     || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM:     process.env.SMTP_FROM     || ''
};
