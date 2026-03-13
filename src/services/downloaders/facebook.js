const cheerio = require('cheerio');

const { http, defaultUserAgent } = require('../../utils/http');

function createFacebookError(message, code = 'FACEBOOK_ERROR', status = 400) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  err.expose = true;
  return err;
}

async function fetchTokens() {
  const { data: html } = await http.get('https://fdownloader.net/id', {
    headers: { 'User-Agent': defaultUserAgent }
  });

  const exMatch = String(html).match(/k_exp\s*=\s*"(\d+)"/i);
  const tokenMatch = String(html).match(/k_token\s*=\s*"([a-f0-9]+)"/i);
  const k_exp = exMatch ? exMatch[1] : null;
  const k_token = tokenMatch ? tokenMatch[1] : null;

  if (!k_exp || !k_token) {
    throw createFacebookError('Gagal mengambil token fdownloader.', 'FACEBOOK_TOKEN', 502);
  }

  return { k_exp, k_token };
}

function pickBestVideo(videos) {
  if (!Array.isArray(videos) || videos.length === 0) return '';

  const score = (q) => {
    const s = String(q || '').toLowerCase();
    const m = s.match(/(\d{3,4})p/);
    if (m) return Number(m[1]);
    if (s.includes('hd')) return 720;
    if (s.includes('sd')) return 480;
    return 0;
  };

  return [...videos]
    .filter((v) => v && v.url)
    .sort((a, b) => score(b.quality) - score(a.quality))[0]?.url || '';
}

async function downloadFacebook(url) {
  if (!/facebook\.|fb\.watch/i.test(url)) {
    throw createFacebookError('URL Facebook tidak valid.', 'INVALID_URL');
  }

  const { k_exp, k_token } = await fetchTokens();

  const params = new URLSearchParams({
    k_exp,
    k_token,
    q: url,
    lang: 'id',
    web: 'fdownloader.net',
    v: 'v2',
    w: ''
  });

  const { data } = await http.post('https://v3.fdownloader.net/api/ajaxSearch?lang=id', params, {
    headers: {
      Origin: 'https://fdownloader.net',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': defaultUserAgent
    }
  });

  if (!data || data.status !== 'ok' || !data.data) {
    throw createFacebookError('Gagal memproses video Facebook.', 'FACEBOOK_AJAX', 502);
  }

  const $ = cheerio.load(String(data.data));

  const videos = $('#fbdownloader')
    .find('.tab__content')
    .eq(0)
    .find('tr')
    .map((i, el) => {
      const quality = $(el).find('.video-quality').text().trim();
      const link =
        $(el).find('a').attr('href') ||
        $(el).find('button').attr('data-videourl') ||
        '';
      if (!link || link === '#note_convert') return null;
      return { quality, url: link };
    })
    .get()
    .filter(Boolean);

  const result = {
    title: $('.thumbnail > .content > .clearfix > h3').text().trim(),
    duration: $('.thumbnail > .content > .clearfix > p').text().trim(),
    thumbnail: $('.thumbnail > .image-fb > img').attr('src') || '',
    videos,
    video: pickBestVideo(videos),
    music: $('#fbdownloader').find('#audioUrl').attr('value') || '',
    // Some responses contain an embeddable media src.
    media: $('#popup_play > .popup-body > .popup-content > #vid').attr('src') || ''
  };

  if (!result.video && !result.music && !result.videos.length) {
    throw createFacebookError('Tidak ada media yang bisa diambil dari URL tersebut.', 'FACEBOOK_EMPTY', 404);
  }

  return result;
}

module.exports = { downloadFacebook };
