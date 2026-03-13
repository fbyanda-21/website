const cheerio = require('cheerio');

const { http } = require('../../utils/http');

function createTikTokError(message, code = 'TIKTOK_ERROR', status = 400) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  err.expose = true;
  return err;
}

async function viaTikwm(url) {
  const params = new URLSearchParams({ url, hd: '1' });
  const { data } = await http.post('https://tikwm.com/api/', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Cookie: 'current_language=en'
    }
  });

  if (!data || !data.data) return null;

  const d = data.data;
  return {
    provider: 'tikwm',
    type: 'video',
    title: d.title || '',
    thumbnail: d.cover || d.origin_cover || '',
    author: d.author?.unique_id || d.author?.nickname || '',
    video: d.play || d.wmplay || '',
    music: d.music || '',
    raw: data
  };
}

async function viaSavetik(url) {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Origin: 'https://savetik.co',
    Referer: 'https://savetik.co/id/tiktok-mp3-downloader',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)',
    'X-Requested-With': 'XMLHttpRequest'
  };
  const body = new URLSearchParams();
  body.append('q', url);
  body.append('lang', 'id');

  const { data } = await http.post('https://savetik.co/api/ajaxSearch', body, { headers });
  if (!data || !data.data) return null;

  const $ = cheerio.load(String(data.data));

  const title = $('h3').text().trim();
  const thumbnail = $('.thumbnail img').attr('src') || '';

  const isPhoto = $('.photo-list .download-items__btn a').length > 0;
  if (isPhoto) {
    const images = [];
    $('.photo-list .download-items__btn a').each((_, el) => {
      const link = $(el).attr('href');
      if (link) images.push(link);
    });
    const audio =
      $('a')
        .filter((_, el) => $(el).text().toLowerCase().includes('mp3'))
        .first()
        .attr('href') || '';

    return {
      provider: 'savetik',
      type: 'photo',
      title,
      thumbnail,
      images,
      music: audio
    };
  }

  const results = { mp3: '', video_hd: '', video_sd: '' };
  $('a.tik-button-dl').each((_, el) => {
    const text = $(el).text().toLowerCase();
    const href = $(el).attr('href') || '';
    if (!href) return;
    if (text.includes('mp3')) results.mp3 = href;
    else if (text.includes('hd')) results.video_hd = href;
    else if (text.includes('mp4')) results.video_sd = href;
  });

  const video = results.video_hd || results.video_sd || '';
  return {
    provider: 'savetik',
    type: 'video',
    title,
    thumbnail,
    video,
    music: results.mp3
  };
}

async function downloadTikTok(url) {
  if (!/^https?:\/\//i.test(url)) {
    throw createTikTokError('URL harus diawali http/https.', 'INVALID_URL');
  }
  if (!/tiktok\.com/i.test(url)) {
    throw createTikTokError('URL TikTok tidak valid.', 'INVALID_URL');
  }

  const attempts = [
    async () => await viaTikwm(url),
    async () => await viaSavetik(url)
  ];

  let lastErr = null;
  for (const fn of attempts) {
    try {
      const r = await fn();
      if (r && (r.video || r.music || (Array.isArray(r.images) && r.images.length))) return r;
    } catch (e) {
      lastErr = e;
    }
  }

  throw createTikTokError(
    'Gagal mengambil media TikTok. Coba lagi beberapa saat.',
    'TIKTOK_DOWNSTREAM',
    lastErr?.status || 502
  );
}

module.exports = { downloadTikTok };
