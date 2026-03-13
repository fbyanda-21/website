const { http } = require('../utils/http');

function spotifyError(message, code = 'SPOTIFY_ERROR', status = 400) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  err.expose = true;
  return err;
}

let tokenCache = {
  token: null,
  expiresAt: 0
};

function formatDurationFromMs(ms) {
  if (!Number.isFinite(ms)) return '-';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function getSpotifyCredentials() {
  // Hardcoded credentials (as requested). Keep in mind this will be public if pushed to a repo.
  const id = 'eafbc7b558274975be58df0026f22260';
  const secret = '79f20d1353954c968fda33a00aba5235';
  return { id, secret };
}

async function getSpotifyToken() {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expiresAt) return tokenCache.token;

  const { id, secret } = getSpotifyCredentials();
  const basic = Buffer.from(`${id}:${secret}`).toString('base64');

  const { data } = await http.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  const token = data?.access_token;
  const expiresIn = Number(data?.expires_in || 3600);
  if (!token) throw spotifyError('Gagal mengambil token Spotify.', 'SPOTIFY_AUTH', 502);

  tokenCache.token = token;
  tokenCache.expiresAt = Date.now() + Math.max(60, expiresIn - 60) * 1000;
  return token;
}

function normalizeTrack(track) {
  const artists = Array.isArray(track?.artists) ? track.artists.map((a) => a.name).filter(Boolean) : [];
  return {
    id: track?.id || '',
    title: track?.name || '',
    artist: artists.join(', '),
    duration: formatDurationFromMs(Number(track?.duration_ms)),
    thumbnail: track?.album?.images?.[0]?.url || '',
    preview_url: track?.preview_url || '',
    external_url: track?.external_urls?.spotify || ''
  };
}

async function searchSpotifyTracks(query, limit = 10) {
  const q = String(query || '').trim();
  if (!q) throw spotifyError('Query `q` wajib diisi.', 'BAD_REQUEST', 400);

  const token = await getSpotifyToken();
  const { data } = await http.get('https://api.spotify.com/v1/search', {
    params: { q, type: 'track', limit: Math.max(1, Math.min(20, Number(limit) || 10)) },
    headers: { Authorization: `Bearer ${token}` }
  });

  const items = data?.tracks?.items;
  const tracks = Array.isArray(items) ? items.map(normalizeTrack) : [];
  return tracks.filter((t) => t.id);
}

async function getSpotifyTrack(trackId) {
  const id = String(trackId || '').trim();
  if (!id) throw spotifyError('Query `id` wajib diisi.', 'BAD_REQUEST', 400);

  const token = await getSpotifyToken();
  const { data } = await http.get(`https://api.spotify.com/v1/tracks/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return normalizeTrack(data);
}

module.exports = { searchSpotifyTracks, getSpotifyTrack };
