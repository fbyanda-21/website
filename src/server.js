const path = require('path');

const compression = require('compression');
const express = require('express');
const rateLimit = require('express-rate-limit');

const apiRouter = require('./routes/api');

const app = express();

// If behind a reverse proxy (nginx/vercel), this makes req.ip use X-Forwarded-For.
app.set('trust proxy', 1);

app.disable('x-powered-by');
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'yanzz-dl', time: new Date().toISOString() });
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({
      ok: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Terlalu banyak request, coba lagi nanti.'
      }
    });
  }
});

const publicDir = path.join(__dirname, '..', 'public');
app.use(
  express.static(publicDir, {
    etag: true,
    lastModified: true,
    maxAge: '1h',
    setHeaders(res, filePath) {
      const musicDir = `${path.sep}assets${path.sep}music${path.sep}`;
      const imgDir = `${path.sep}assets${path.sep}img${path.sep}`;
      if (filePath.includes(musicDir) || filePath.includes(imgDir)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  })
);

app.use('/api/v1', apiLimiter, apiRouter);

// Convenience API routes without /api/v1 prefix.
// Scoped to avoid rate-limiting static assets / SPA navigation.
app.use((req, res, next) => {
  if (req.path.startsWith('/spotify/') || req.path.startsWith('/download/')) {
    return apiLimiter(req, res, () => apiRouter(req, res, next));
  }
  return next();
});

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
