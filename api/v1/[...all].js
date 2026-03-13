const compression = require('compression');
const express = require('express');

const apiRouter = require('../../src/routes/api');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Vercel maps this file under /api/v1/*, so mount router at root.
app.use('/', apiRouter);

// Error handler
app.use((err, req, res, next) => {
  const status = Number(err.status) || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.expose ? err.message : 'Internal server error';
  res.status(status).json({ ok: false, error: { code, message } });
});

module.exports = app;
