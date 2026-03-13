const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

function createYouTubeError(message, code = 'YOUTUBE_ERROR', status = 400) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  err.expose = true;
  return err;
}

function parseWantedHeight(quality) {
  if (!quality) return 0;
  const m = String(quality).toLowerCase().match(/(\d{3,4})/);
  return m ? Number(m[1]) : 0;
}

function pickBestVideo(medias, wantedHeight) {
  const candidates = medias
    .filter((m) => m && m.type === 'video' && m.ext === 'mp4' && m.url)
    .map((m) => ({
      url: m.url,
      quality: m.quality || '',
      height: Number(m.height || 0),
      bitrate: Number(m.bitrate || 0),
      ext: m.ext || 'mp4'
    }));

  if (!candidates.length) return null;

  const sorted = [...candidates].sort((a, b) => {
    if (b.height !== a.height) return b.height - a.height;
    return b.bitrate - a.bitrate;
  });

  if (!wantedHeight) return sorted[0];

  const underOrEqual = sorted.filter((v) => v.height && v.height <= wantedHeight);
  return underOrEqual[0] || sorted[0];
}

function pickBestAudio(medias) {
  const byBitrate = (a, b) => Number(b.bitrate || 0) - Number(a.bitrate || 0);
  const opus = medias
    .filter((m) => m && m.type === 'audio' && m.ext === 'opus' && m.url)
    .sort(byBitrate)[0];
  if (opus) {
    return {
      url: opus.url,
      quality: opus.label || '',
      ext: opus.ext || 'opus'
    };
  }
  const m4a = medias
    .filter((m) => m && m.type === 'audio' && m.ext === 'm4a' && m.url)
    .sort(byBitrate)[0];
  if (!m4a) return null;
  return {
    url: m4a.url,
    quality: m4a.label || '',
    ext: m4a.ext || 'm4a'
  };
}

async function cliptoYouTube(url) {
  const payload = JSON.stringify({ url });
  const res = await fetch('https://www.clipto.com/api/youtube', {
    method: 'POST',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 15; 23124RA7EO Build/AQ3A.240829.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.7444.174 Mobile Safari/537.36',
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Origin: 'https://www.clipto.com',
      Referer: 'https://www.clipto.com/id/media-downloader/youtube-downloader',
      'X-Requested-With': 'mark.via.gp',
      Cookie:
        'NEXT_LOCALE=id; traffic-source=stripe-web-ytd-seo-ytd; traffic-history=seo; merge-video-api=1; vd-down-app=a'
    },
    body: payload
  });

  if (!res.ok) {
    throw createYouTubeError(`Provider Clipto error (HTTP ${res.status}).`, 'YOUTUBE_UPSTREAM', 502);
  }

  const result = await res.json().catch(() => null);
  if (!result || !Array.isArray(result.medias)) {
    throw createYouTubeError('Media tidak ditemukan.', 'YOUTUBE_EMPTY', 404);
  }

  return result;
}

async function downloadYouTube(url, opts = {}) {
  if (!/^https?:\/\//i.test(url)) {
    throw createYouTubeError('URL harus diawali http/https.', 'INVALID_URL');
  }
  if (!/youtube\.com|youtu\.be/i.test(url)) {
    throw createYouTubeError('URL YouTube tidak valid.', 'INVALID_URL');
  }

  const quality = String(opts.quality || '').trim();
  const wantedHeight = parseWantedHeight(quality);

  const result = await cliptoYouTube(url);
  const medias = result.medias;

  const video = pickBestVideo(medias, wantedHeight);
  const audio = pickBestAudio(medias);

  if (!video && !audio) {
    throw createYouTubeError('Media tidak ditemukan.', 'YOUTUBE_EMPTY', 404);
  }

  return {
    title: result.title || 'YouTube Media',
    video: video?.url || '',
    music: audio?.url || '',
    selected: {
      video: video ? { quality: video.quality, ext: video.ext, height: video.height } : null,
      audio: audio ? { quality: audio.quality, ext: audio.ext } : null
    },
    provider: 'clipto'
  };
}

module.exports = { downloadYouTube };
