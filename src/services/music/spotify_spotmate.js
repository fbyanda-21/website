const https = require('https');
const cheerio = require('cheerio');

const { http } = require('../../utils/http');

function spotmateError(message, code = 'SPOTMATE_ERROR', status = 400, details) {
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

async function getSpotmateDownloadUrl(input) {
  const trackUrl = extractSpotifyTrackUrl(input);
  if (!trackUrl) throw spotmateError('URL/ID track Spotify tidak valid.', 'INVALID_URL', 400);

  const base = 'https://spotmate.online';

  // Use a dedicated client to avoid interference.
  const client = http.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    timeout: 30_000,
    validateStatus: () => true,
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: '*/*'
    }
  });

  const page = await client.get(base + '/en1');
  if (page.status !== 200 || !page.data) {
    throw spotmateError('Gagal membuka halaman converter.', 'UPSTREAM_ERROR', 502, { status: page.status });
  }

  const cookies = page.headers?.['set-cookie'] || [];
  const cookieString = Array.isArray(cookies) ? cookies.map((v) => String(v).split(';')[0]).join('; ') : '';

  const $ = cheerio.load(String(page.data || ''));
  const csrf = $('meta[name="csrf-token"]').attr('content');
  if (!csrf) {
    throw spotmateError('CSRF token tidak ditemukan.', 'UPSTREAM_ERROR', 502);
  }

  const convert = await client.post(
    base + '/convert',
    { urls: trackUrl },
    {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: base + '/en1',
        Origin: base,
        'X-CSRF-TOKEN': csrf,
        Cookie: cookieString
      }
    }
  );

  if (convert.status !== 200) {
    throw spotmateError('Convert gagal.', 'UPSTREAM_ERROR', 502, { status: convert.status });
  }
  if (!convert.data || typeof convert.data !== 'object') {
    throw spotmateError('Convert gagal: respon tidak valid.', 'UPSTREAM_ERROR', 502);
  }
  if (convert.data.error) {
    throw spotmateError('Convert gagal: upstream error.', 'UPSTREAM_ERROR', 502, { error: convert.data.error });
  }
  if (!convert.data.url) {
    throw spotmateError('Convert gagal: missing url.', 'UPSTREAM_ERROR', 502);
  }

  return {
    trackUrl,
    downloadUrl: String(convert.data.url)
  };
}

module.exports = { getSpotmateDownloadUrl, extractSpotifyTrackUrl };
