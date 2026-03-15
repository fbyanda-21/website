const cheerio = require('cheerio');
const vm = require('vm');

const { http } = require('../../utils/http');

function createInstagramError(message, code = 'INSTAGRAM_ERROR', status = 400) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  err.expose = true;
  return err;
}

async function downloadInstagram(url) {
  if (!/^https?:\/\//i.test(url)) {
    throw createInstagramError('URL harus diawali http/https.', 'INVALID_URL');
  }
  if (!/instagram\.com|instagr\.am/i.test(url)) {
    throw createInstagramError('URL Instagram tidak valid.', 'INVALID_URL');
  }

  const payload = new URLSearchParams({
    url,
    action: 'post',
    lang: 'id'
  });

  const { data: obfuscatedScript } = await http.post('https://savegram.info/action.php', payload.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Referer: 'https://savegram.info/id'
    }
  });

  if (typeof obfuscatedScript !== 'string' || !obfuscatedScript.trim()) {
    throw createInstagramError('Respon tidak valid dari Savegram.', 'INSTAGRAM_UPSTREAM', 502);
  }

  let capturedHtml = '';
  const context = {
    window: { location: { hostname: 'savegram.info' } },
    pushAlert: () => {},
    gtag: () => {},
    document: {
      getElementById: (id) => {
        if (id === 'div_download') {
          return {
            set innerHTML(html) {
              capturedHtml = html;
            }
          };
        }
        return { style: {}, remove: () => {} };
      },
      querySelector: () => ({ classList: { remove: () => {} } })
    }
  };

  vm.createContext(context);
  new vm.Script(obfuscatedScript).runInContext(context);

  if (!capturedHtml) {
    throw createInstagramError('Gagal mengekstrak hasil download.', 'INSTAGRAM_PARSE', 502);
  }

  const $ = cheerio.load(capturedHtml);
  const items = [];
  $('.download-items').each((_, el) => {
    const item = $(el);
    const thumbnail = item.find('img').attr('src') || '';
    const btn = item.find('.download-items__btn a');
    const url_download = btn.attr('href') || '';
    const label = btn.text().trim() || 'download';
    if (!url_download) return;

    const u = String(url_download);
    const l = String(label).toLowerCase();

    let type = 'file';
    if (/video/.test(l) || /\.mp4(\?|$)/i.test(u)) type = 'video';
    else if (/photo|image|gambar/.test(l)) type = 'image';
    else if (/\.(jpg|jpeg|png|webp)(\?|$)/i.test(u)) type = 'image';
    else if (/\.(jpg|jpeg|png|webp)(\?|$)/i.test(thumbnail)) type = 'image';

    items.push({ thumbnail, label, url: url_download, type });
  });

  if (!items.length) {
    throw createInstagramError('Tidak ada media yang ditemukan.', 'INSTAGRAM_EMPTY', 404);
  }

  const title = $('h2').first().text().trim() || $('h3').first().text().trim() || '';

  const images = items.filter((it) => it.type === 'image').map((it) => it.url);
  const videos = items.filter((it) => it.type === 'video').map((it) => it.url);

  return {
    title,
    items,
    images,
    videos,
    image: images[0] || '',
    video: videos[0] || '',
    music: ''
  };
}

module.exports = { downloadInstagram };
