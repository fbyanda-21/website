const { http } = require('../../utils/http');

const mobileUserAgent =
  'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36';

function upstreamForbiddenHint() {
  return (
    'Upstream blocked (HTTP 403) from spotify.downloaderize.com. ' +
    'This often happens on Vercel/other serverless IP ranges (Cloudflare anti-bot). '
  );
}

function spotifyError(message, code = 'SPOTIFY_ERROR', status = 400, details) {
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

  return null;
}

function pickNonce(html, key) {
  const s = String(html || '');
  if (!s) return null;

  if (key === 'sts_ajax') {
    const m = s.match(/var\s+sts_ajax\s*=\s*\{[^}]*"nonce"\s*:\s*"([^"]+)"/i);
    if (m) return m[1];
  }

  if (key === 'spotifyDownloader') {
    const m = s.match(/var\s+spotifyDownloader\s*=\s*\{[^}]*"nonce"\s*:\s*"([^"]+)"/i);
    if (m) return m[1];
  }

  const any = s.match(/"nonce"\s*:\s*"([^"]+)"/i);
  return any ? any[1] : null;
}

async function fetchNonce(kind) {
  try {
    const { data } = await http.get('https://spotify.downloaderize.com', {
      headers: {
        'User-Agent': mobileUserAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: 'https://spotify.downloaderize.com/'
      }
    });
    const nonce = pickNonce(data, kind);
    if (!nonce) throw spotifyError('Gagal mengambil nonce upstream.', 'UPSTREAM_ERROR', 502);
    return nonce;
  } catch (e) {
    const status = e?.response?.status;
    if (status === 403) {
      throw spotifyError(upstreamForbiddenHint(), 'UPSTREAM_FORBIDDEN', 502);
    }
    throw spotifyError('Gagal menghubungi upstream untuk nonce.', 'UPSTREAM_ERROR', 502, {
      status: status || null
    });
  }
}

async function spotifySearch(query, limit = 20) {
  const q = String(query || '').trim();
  if (!q) throw spotifyError('Query `q` wajib diisi.', 'BAD_REQUEST', 400);

  const lim = Math.max(1, Math.min(25, Number(limit) || 20));

  const security = await fetchNonce('sts_ajax');

  let data;
  try {
    const res = await http.get('https://spotify.downloaderize.com/wp-admin/admin-ajax.php', {
      params: {
        action: 'sts_search_spotify',
        query: q,
        security
      },
      headers: {
        'User-Agent': mobileUserAgent,
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'x-requested-with': 'XMLHttpRequest',
        Referer: 'https://spotify.downloaderize.com/'
      }
    });
    data = res.data;
  } catch (e) {
    const status = e?.response?.status;
    if (status === 403) {
      throw spotifyError(upstreamForbiddenHint(), 'UPSTREAM_FORBIDDEN', 502);
    }
    throw spotifyError('Gagal request search ke upstream.', 'UPSTREAM_ERROR', 502, {
      status: status || null
    });
  }

  const items = data?.data?.tracks?.items || [];
  const results = Array.isArray(items)
    ? items.slice(0, lim)
        .map((v) => ({
          title: v?.name || '',
          artist: Array.isArray(v?.artists) ? v.artists.map((a) => a?.name).filter(Boolean).join(', ') : '',
          album: v?.album?.name || '',
          thumbnail: v?.album?.images?.[0]?.url || '',
          url: v?.id ? `https://open.spotify.com/track/${v.id}` : ''
        }))
        .filter((r) => r.title && r.artist && r.url)
    : [];

  return {
    query: q,
    total: results.length,
    results,
    provider: 'downloaderize'
  };
}

async function spotifyDownload(inputUrl) {
  const url = extractSpotifyTrackUrl(inputUrl);
  if (!url) throw spotifyError('Query `url` harus URL/ID track Spotify.', 'INVALID_URL', 400);

  const nonce = await fetchNonce('spotifyDownloader');

  const body = new URLSearchParams({
    action: 'spotify_downloader_get_info',
    url,
    nonce
  });

  let data;
  try {
    const res = await http.post('https://spotify.downloaderize.com/wp-admin/admin-ajax.php', body.toString(), {
      headers: {
        'User-Agent': mobileUserAgent,
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
        Origin: 'https://spotify.downloaderize.com',
        Referer: 'https://spotify.downloaderize.com/'
      }
    });
    data = res.data;
  } catch (e) {
    const status = e?.response?.status;
    if (status === 403) {
      throw spotifyError(upstreamForbiddenHint(), 'UPSTREAM_FORBIDDEN', 502);
    }
    throw spotifyError('Gagal request download ke upstream.', 'UPSTREAM_ERROR', 502, {
      status: status || null
    });
  }

  const d = data?.data;
  if (!d || typeof d !== 'object') {
    throw spotifyError('Respon upstream tidak valid.', 'UPSTREAM_ERROR', 502);
  }

  const media0 = Array.isArray(d.medias) ? d.medias[0] : null;
  const download = media0?.url || '';

  return {
    url,
    title: d.title || '',
    artist: d.author || '',
    duration: d.duration || '',
    thumbnail: d.thumbnail || '',
    type: d.type || '',
    download,
    quality: media0?.quality || '',
    extension: media0?.extension || '',
    provider: 'downloaderize'
  };
}

module.exports = { spotifySearch, spotifyDownload };
