const path = require('path');

const compression = require('compression');
const express = require('express');

const apiRouter = require('./routes/api');

const app = express();

app.disable('x-powered-by');
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'yanzz-dl', time: new Date().toISOString() });
});

app.use('/api/v1', apiRouter);

const publicDir = path.join(__dirname, '..', 'public');
app.use(
  express.static(publicDir, {
    etag: true,
    lastModified: true,
    maxAge: '1h',
    setHeaders(res, filePath) {
      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  })
);

// SPA fallback (keep background music alive across navigation)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  const status = Number(err.status) || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.expose ? err.message : 'Internal server error';
  res.status(status).json({ ok: false, error: { code, message } });
});

const port = Number(process.env.PORT) || 8676;
app.listen(port, () => {
  console.log(`[yanzz-dl] listening on http://localhost:${port}`);
});
