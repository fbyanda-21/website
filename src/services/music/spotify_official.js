const { http } = require('../../utils/http');

function spotifyOfficialError(message, code = 'SPOTIFY_OFFICIAL_ERROR', status = 400, details) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  err.expose = true;
  if (details) err.details = details;
  return err;
}

function env(name) {
  return String(process.env[name] || '').trim();
}

function formatDurationFromMs(ms) {
  if (!Number.isFinite(ms)) return '';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function extractTrackId(input) {
  const text = String(input || '').trim();
  if (!text) return null;
  if (/^[A-Za-z0-9]{22}$/.test(text)) return text;
  const m = text.match(/open\.spotify\.com\/track\/([A-Za-z0-9]{22})/i);
  return m ? m[1] : null;
}

let tokenCache = {
  token: null,
  expiresAt: 0
};

async function getAppToken() {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expiresAt) return tokenCache.token;

  const clientId = env('SPOTIFY_CLIENT_ID');
  const clientSecret = env('SPOTIFY_CLIENT_SECRET');
  if (!clientId || !clientSecret) {
    throw spotifyOfficialError(
      'Server belum dikonfigurasi: set env SPOTIFY_CLIENT_ID dan SPOTIFY_CLIENT_SECRET.',
      'MISSING_SPOTIFY_CREDENTIALS',
      500
    );
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = new URLSearchParams({ grant_type: 'client_credentials' });

  const { data } = await http.post('https://accounts.spotify.com/api/token', body.toString(), {
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    timeout: 20_000
  });

  const token = data?.access_token;
  const expiresIn = Number(data?.expires_in || 3600);
  if (!token) throw spotifyOfficialError('Gagal mengambil token Spotify.', 'TOKEN_ERROR', 502);

  tokenCache.token = token;
  tokenCache.expiresAt = Date.now() + Math.max(60, expiresIn - 60) * 1000;
  return token;
}

function mapTrack(track) {
  return {
    id: track?.id || '',
    title: track?.name || '',
    artist: Array.isArray(track?.artists) ? track.artists.map((a) => a?.name).filter(Boolean).join(', ') : '',
    album: track?.album?.name || '',
    thumbnail: track?.album?.images?.[0]?.url || '',
    preview: track?.preview_url || '',
    duration: formatDurationFromMs(track?.duration_ms),
    url: track?.id ? `https://open.spotify.com/track/${track.id}` : ''
  };
}

async function searchSpotifyTracks(query, limit = 15) {
  const q = String(query || '').trim();
  if (!q) throw spotifyOfficialError('Query `q` wajib diisi.', 'BAD_REQUEST', 400);
  const lim = Math.max(1, Math.min(25, Number(limit) || 15));

  const token = await getAppToken();

  const { data } = await http.get('https://api.spotify.com/v1/search', {
    params: {
      q,
      type: 'track',
      limit: lim
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    timeout: 20_000
  });

  const items = data?.tracks?.items;
  const results = Array.isArray(items) ? items.map(mapTrack).filter((r) => r.title && r.artist && r.url) : [];

  return {
    query: q,
    total: results.length,
    results,
    provider: 'spotify'
  };
}

async function getSpotifyTrackMeta(input) {
  const id = extractTrackId(input);
  if (!id) throw spotifyOfficialError('URL/ID track Spotify tidak valid.', 'INVALID_URL', 400);

  const token = await getAppToken();
  const { data: track } = await http.get(`https://api.spotify.com/v1/tracks/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    timeout: 20_000
  });

  return mapTrack(track);
}

module.exports = {
  searchSpotifyTracks,
  getSpotifyTrackMeta,
  extractTrackId
};
