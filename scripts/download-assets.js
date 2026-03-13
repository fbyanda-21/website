const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function downloadToFile(url, outPath) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    }
  });
  if (!res.ok || !res.body) {
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  }
  await pipeline(res.body, fs.createWriteStream(outPath));
}

async function main() {
  const root = path.join(__dirname, '..');
  const musicDir = path.join(root, 'public', 'assets', 'music');
  const imgDir = path.join(root, 'public', 'assets', 'img');
  await ensureDir(musicDir);
  await ensureDir(imgDir);

  const music = [
    ['01-death-bed.mp3', 'https://files.catbox.moe/spadk5.mp3'],
    ['02-lemon-tree.mp3', 'https://files.catbox.moe/l7yjkn.mp3'],
    ['03-surrender.mp3', 'https://files.catbox.moe/64rrze.mp3'],
    ['04-past-lives.mp3', 'https://files.catbox.moe/rg0mtu.mp3'],
    ['05-play-date.mp3', 'https://files.catbox.moe/05vn8z.mp3'],
    ['06-trouble-is-a-friend.mp3', 'https://files.catbox.moe/fdw8o8.mp3'],
    ['07-rude.mp3', 'https://files.catbox.moe/c6gtik.mp3'],
    ['08-love-story-ts.mp3', 'https://files.catbox.moe/rm82lu.mp3'],
    ['09-love-story-indila.mp3', 'https://files.catbox.moe/mqxmmt.mp3'],
    ['10-dusk-till-dawn.mp3', 'https://files.catbox.moe/ulw7i2.mp3'],
    ['11-somewhere-only-we-know.mp3', 'https://files.catbox.moe/c0fspy.mp3'],
    ['12-off-my-face.mp3', 'https://files.catbox.moe/svkvc3.mp3'],
    ['13-dandelions.mp3', 'https://files.catbox.moe/kwaku9.mp3']
  ];

  const logo = ['logo.jpg', 'https://c.termai.cc/i160/GIQ0yy.jpg'];

  console.log('Downloading logo...');
  await downloadToFile(logo[1], path.join(imgDir, logo[0]));

  for (const [name, url] of music) {
    const out = path.join(musicDir, name);
    console.log(`Downloading ${name}...`);
    await downloadToFile(url, out);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
