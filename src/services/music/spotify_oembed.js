const { http } = require('../../utils/http');

function musicError(message, code = 'MUSIC_ERROR', status = 400) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  err.expose = true;
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

async function getSpotifyOEmbedInfo(input) {
  const url = extractSpotifyTrackUrl(input);
  if (!url) throw musicError('URL/ID track Spotify tidak valid.', 'INVALID_URL', 400);

  const { data } = await http.get('https://open.spotify.com/oembed', {
    params: { url },
    headers: { Accept: 'application/json' }
  });

  if (!data || typeof data !== 'object') {
    throw musicError('Respon oEmbed tidak valid.', 'UPSTREAM_ERROR', 502);
  }

  return {
    url,
    title: data.title || '',
    author: data.author_name || '',
    thumbnail: data.thumbnail_url || '',
    provider: 'spotify-oembed'
  };
}

module.exports = { getSpotifyOEmbedInfo };
