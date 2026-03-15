const { http } = require('../../utils/http');

function musicError(message, code = 'MUSIC_ERROR', status = 400, details) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  err.expose = true;
  if (details) err.details = details;
  return err;
}

function extractSpotifyTrackUrl(input) {
  const text = String(input || '').trim();
  if (!text) return null;

  if (/^[A-Za-z0-9]{22}$/.test(text)) {
    return `https://open.spotify.com/track/${text}`;
  }

  const m = text.match(/open\.spotify\.com\/track\/([A-Za-z0-9]{22})/i);
  if (m) return `https://open.spotify.com/track/${m[1]}`;

  if (/spotify\.com\/track\//i.test(text)) return text.split('?')[0];
  return null;
}

function pickMeta(html, key, attr = 'property') {
  const s = String(html || '');
  if (!s) return '';
  const safeKey = String(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<meta\\s+[^>]*${attr}\\s*=\\s*"${safeKey}"[^>]*content\\s*=\\s*"([^"]*)"`, 'i');
  const m = s.match(re);
  return m ? String(m[1] || '') : '';
}

function formatDurationFromSeconds(sec) {
  const n = Number(sec);
  if (!Number.isFinite(n) || n <= 0) return '';
  const m = Math.floor(n / 60);
  const s = Math.floor(n % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function getSpotifyPublicMeta(input) {
  const url = extractSpotifyTrackUrl(input);
  if (!url) throw musicError('URL/ID track Spotify tidak valid.', 'INVALID_URL', 400);

  const { data } = await http.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    timeout: 20_000
  });

  const html = String(data || '');
  if (!html) throw musicError('Respon HTML Spotify kosong.', 'UPSTREAM_ERROR', 502);

  const title = pickMeta(html, 'og:title') || '';
  const desc = pickMeta(html, 'og:description') || '';
  const image = pickMeta(html, 'og:image') || '';
  const audio = pickMeta(html, 'og:audio') || '';
  const durSec = pickMeta(html, 'music:duration', 'name') || '';

  let artist = '';
  let album = '';
  if (desc.includes('·')) {
    const parts = desc.split('·').map((x) => x.trim()).filter(Boolean);
    artist = parts[0] || '';
    album = parts[1] || '';
  }

  return {
    url,
    title,
    artist,
    album,
    duration: formatDurationFromSeconds(durSec),
    thumbnail: image,
    preview: audio,
    provider: 'spotify-public'
  };
}

module.exports = { getSpotifyPublicMeta, extractSpotifyTrackUrl };
