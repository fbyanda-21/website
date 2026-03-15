const { http } = require('../../utils/http');

function musicError(message, code = 'MUSIC_ERROR', status = 400) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  err.expose = true;
  return err;
}

async function searchItunesMusic(query, limit = 10) {
  const q = String(query || '').trim();
  if (!q) throw musicError('Query `q` wajib diisi.', 'BAD_REQUEST', 400);

  const lim = Math.max(1, Math.min(25, Number(limit) || 10));

  const { data } = await http.get('https://itunes.apple.com/search', {
    params: {
      term: q,
      media: 'music',
      entity: 'song',
      limit: lim
    },
    headers: {
      Accept: 'application/json'
    }
  });

  const items = Array.isArray(data?.results) ? data.results : [];
  const results = items
    .map((it) => ({
      title: it.trackName || '',
      artist: it.artistName || '',
      album: it.collectionName || '',
      thumbnail: it.artworkUrl100 || it.artworkUrl60 || '',
      preview: it.previewUrl || '',
      open_url: it.trackViewUrl || ''
    }))
    .filter((r) => r.title && r.artist);

  return {
    query: q,
    total: results.length,
    results,
    provider: 'itunes'
  };
}

module.exports = { searchItunesMusic };
