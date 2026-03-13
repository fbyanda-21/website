const express = require('express');
const rateLimit = require('express-rate-limit');

const { sendError, sendOk } = require('../utils/respond');
const { requireNonEmptyString, isTikTokUrl, isInstagramUrl, isFacebookUrl, isYouTubeUrl } = require('../utils/validate');

const { downloadTikTok } = require('../services/downloaders/tiktok');
const { downloadInstagram } = require('../services/downloaders/instagram');
const { downloadFacebook } = require('../services/downloaders/facebook');
const { downloadYouTube } = require('../services/downloaders/youtube');
const { searchSpotifyTracks, getSpotifyTrack } = require('../services/spotify');

const router = express.Router();

const downloadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    sendError(res, 429, 'RATE_LIMITED', 'Terlalu banyak request download, coba lagi nanti.');
  }
});

router.use('/download', downloadLimiter);

router.get('/health', (req, res) => {
  sendOk(res, { status: 'ok', time: new Date().toISOString() });
});

router.get('/download/tiktok', async (req, res) => {
  const url = String(req.query.url || '').trim();
  if (!requireNonEmptyString(url)) return sendError(res, 400, 'BAD_REQUEST', 'Query `url` wajib diisi.');
  if (!isTikTokUrl(url)) return sendError(res, 400, 'INVALID_URL', 'URL TikTok tidak valid.');
  try {
    const result = await downloadTikTok(url);
    sendOk(res, result);
  } catch (e) {
    sendError(res, e.status || 500, e.code || 'TIKTOK_ERROR', e.message || 'Gagal memproses TikTok.');
  }
});

router.get('/download/instagram', async (req, res) => {
  const url = String(req.query.url || '').trim();
  if (!requireNonEmptyString(url)) return sendError(res, 400, 'BAD_REQUEST', 'Query `url` wajib diisi.');
  if (!isInstagramUrl(url)) return sendError(res, 400, 'INVALID_URL', 'URL Instagram tidak valid.');
  try {
    const result = await downloadInstagram(url);
    sendOk(res, result);
  } catch (e) {
    sendError(res, e.status || 500, e.code || 'INSTAGRAM_ERROR', e.message || 'Gagal memproses Instagram.');
  }
});

router.get('/download/facebook', async (req, res) => {
  const url = String(req.query.url || '').trim();
  if (!requireNonEmptyString(url)) return sendError(res, 400, 'BAD_REQUEST', 'Query `url` wajib diisi.');
  if (!isFacebookUrl(url)) return sendError(res, 400, 'INVALID_URL', 'URL Facebook tidak valid.');
  try {
    const result = await downloadFacebook(url);
    sendOk(res, result);
  } catch (e) {
    sendError(res, e.status || 500, e.code || 'FACEBOOK_ERROR', e.message || 'Gagal memproses Facebook.');
  }
});

router.get('/download/youtube', async (req, res) => {
  const url = String(req.query.url || '').trim();
  const quality = String(req.query.quality || '').trim();
  if (!requireNonEmptyString(url)) return sendError(res, 400, 'BAD_REQUEST', 'Query `url` wajib diisi.');
  if (!isYouTubeUrl(url)) return sendError(res, 400, 'INVALID_URL', 'URL YouTube tidak valid.');
  try {
    const result = await downloadYouTube(url, { quality });
    sendOk(res, result);
  } catch (e) {
    sendError(res, e.status || 500, e.code || 'YOUTUBE_ERROR', e.message || 'Gagal memproses YouTube.');
  }
});

router.get('/music/spotify/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const limit = String(req.query.limit || '').trim();
  try {
    const result = await searchSpotifyTracks(q, limit);
    sendOk(res, { items: result });
  } catch (e) {
    sendError(res, e.status || 500, e.code || 'SPOTIFY_ERROR', e.message || 'Gagal search Spotify.');
  }
});

router.get('/music/spotify/track', async (req, res) => {
  const id = String(req.query.id || '').trim();
  try {
    const result = await getSpotifyTrack(id);
    sendOk(res, result);
  } catch (e) {
    sendError(res, e.status || 500, e.code || 'SPOTIFY_ERROR', e.message || 'Gagal ambil track Spotify.');
  }
});

module.exports = router;
