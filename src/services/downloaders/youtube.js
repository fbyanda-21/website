const { http } = require('../../utils/http');

function createYouTubeError(message, code = 'YOUTUBE_ERROR', status = 400) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  err.expose = true;
  return err;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const SaveNow = {
  api: 'https://p.savenow.to',
  key: process.env.SAVENOW_API_KEY || '',
  async poll(progressUrl, limit = 40) {
    for (let i = 0; i < limit; i++) {
      try {
        const { data } = await http.get(progressUrl);
        if (data && data.success === 1 && data.download_url) return data;
        if (data && data.success === -1) break;
      } catch (e) {
        // ignore
      }
      await sleep(2500);
    }
    return null;
  }
};

function normalizeQuality(q) {
  if (!q) return '720';
  const s = String(q).toLowerCase().trim();
  const m = s.match(/(\d{3,4})/);
  return m ? m[1] : '720';
}

async function ytdlv1(url, type) {
  try {
    const endpoint =
      type === 'audio'
        ? `https://ytdlpyton.nvlgroup.my.id/download/audio?url=${encodeURIComponent(url)}&mode=url`
        : `https://ytdlpyton.nvlgroup.my.id/download/?url=${encodeURIComponent(url)}&resolution=${encodeURIComponent(type)}&mode=url`;
    const { data } = await http.get(endpoint);
    if (!data || !data.download_url) return { ok: false };
    return {
      ok: true,
      provider: 'ytdlpyton',
      title: data.title || 'YouTube Media',
      download_url: data.download_url
    };
  } catch (e) {
    return { ok: false };
  }
}

async function ytdlv2(url, type) {
  try {
    const format = type === 'audio' ? 'mp3' : 'mp4';
    const { data } = await http.get(
      `https://api.nekolabs.my.id/downloader/youtube/v1?url=${encodeURIComponent(url)}&format=${format}`
    );
    if (data && data.success && data.result) {
      return {
        ok: true,
        provider: 'nekolabs',
        title: data.result.title || 'YouTube Media',
        download_url: data.result.downloadUrl
      };
    }
    return { ok: false };
  } catch (e) {
    return { ok: false };
  }
}

async function ytdlv3(url, resolution) {
  try {
    const { data } = await http.get(
      `https://anabot.my.id/api/download/ytmp4?url=${encodeURIComponent(url)}&quality=${encodeURIComponent(
        resolution
      )}&apikey=freeApikey`
    );
    const u = data?.data?.result?.urls;
    const title = data?.data?.result?.metadata?.title;
    if (!data?.success || !u) return { ok: false };
    return {
      ok: true,
      provider: 'anabot',
      title: title || 'YouTube Video',
      download_url: u
    };
  } catch (e) {
    return { ok: false };
  }
}

async function ytdlv4(url, res) {
  try {
    if (!SaveNow.key) return { ok: false };
    const format = res === 'audio' ? 'mp3' : String(res);
    const { data: init } = await http.get(`${SaveNow.api}/ajax/download.php`, {
      params: { copyright: 0, format, url, api: SaveNow.key }
    });
    if (!init || !init.success || !init.progress_url) return { ok: false };
    const result = await SaveNow.poll(init.progress_url);
    if (!result || !result.download_url) return { ok: false };
    return {
      ok: true,
      provider: 'savenow',
      title: init.info?.title || 'YouTube Media',
      download_url: result.download_url
    };
  } catch (e) {
    return { ok: false };
  }
}

async function resolveOne(url, kind, quality) {
  const q = normalizeQuality(quality);
  const type = kind === 'audio' ? 'audio' : q;

  const fns = [
    () => ytdlv1(url, type),
    () => (kind === 'audio' ? ytdlv2(url, 'audio') : ytdlv2(url, 'video')),
    () => (kind === 'audio' ? Promise.resolve({ ok: false }) : ytdlv3(url, q)),
    () => ytdlv4(url, kind === 'audio' ? 'audio' : q)
  ];

  for (const fn of fns) {
    const r = await fn();
    if (r && r.ok && r.download_url) return r;
  }
  return null;
}

async function downloadYouTube(url, opts = {}) {
  if (!/^https?:\/\//i.test(url)) {
    throw createYouTubeError('URL harus diawali http/https.', 'INVALID_URL');
  }
  if (!/youtube\.com|youtu\.be/i.test(url)) {
    throw createYouTubeError('URL YouTube tidak valid.', 'INVALID_URL');
  }

  const quality = opts.quality;
  const [videoRes, audioRes] = await Promise.all([
    resolveOne(url, 'video', quality),
    resolveOne(url, 'audio', quality)
  ]);

  if (!videoRes && !audioRes) {
    throw createYouTubeError('Gagal memproses YouTube (semua provider gagal).', 'YOUTUBE_DOWNSTREAM', 502);
  }

  return {
    title: videoRes?.title || audioRes?.title || 'YouTube Media',
    video: videoRes?.download_url || '',
    music: audioRes?.download_url || '',
    providers: {
      video: videoRes?.provider || '',
      audio: audioRes?.provider || ''
    },
    quality: normalizeQuality(quality)
  };
}

module.exports = { downloadYouTube };
