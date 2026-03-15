# yanzz-dl

Single-page downloader app (Express + SPA) untuk:
- TikTok
- Instagram
- YouTube
- Facebook

Checklist
- [x] Express server + static hosting SPA
- [x] Background music tetap jalan saat pindah halaman (client-side routing)
- [x] API downloader: TikTok / Instagram / YouTube / Facebook
- [x] Rate limit untuk endpoint API
- [x] PM2 ecosystem config (port default 8676)
- [ ] Tambah rate limit + caching (opsional)
- [ ] Tambah logging request + tracing error (opsional)

## Requirements
- Node.js 18+ (disarankan)
- PM2 (untuk deploy proses)

## Install
```bash
npm install
```

## Download music + logo assets
```bash
npm run download:assets
```

Nama file music (lokal)
- `public/assets/music/01-death-bed.mp3`
- `public/assets/music/02-lemon-tree.mp3`
- `public/assets/music/03-surrender.mp3`
- `public/assets/music/04-past-lives.mp3`
- `public/assets/music/05-play-date.mp3`
- `public/assets/music/06-trouble-is-a-friend.mp3`
- `public/assets/music/07-rude.mp3`
- `public/assets/music/08-love-story-ts.mp3`
- `public/assets/music/09-love-story-indila.mp3`
- `public/assets/music/10-dusk-till-dawn.mp3`
- `public/assets/music/11-somewhere-only-we-know.mp3`
- `public/assets/music/12-off-my-face.mp3`
- `public/assets/music/13-dandelions.mp3`

## Run (dev)
```bash
npm run dev
```

## Run (prod)
```bash
npm start
```

## Run with PM2
```bash
pm2 start ecosystem.config.js
pm2 status
pm2 logs yanzz-dl
```

## Deploy (Vercel)
- Frontend: `public/` (served as static)
- API: `api/v1/handler.js` (Serverless Function)
- SPA routes (contoh `/tiktok`) di-handle oleh `vercel.json` rewrite ke `public/index.html`

Port
- Default: `8676`
- Override: set env `PORT`

## Endpoints

Health
- `GET /health`
- `GET /api/v1/health`

Downloader API (JSON)
- `GET /api/v1/download/tiktok?url=...`
- `GET /api/v1/download/instagram?url=...`
- `GET /api/v1/download/youtube?url=...&quality=720`
- `GET /api/v1/download/facebook?url=...`

Response shape
```json
{
  "ok": true,
  "result": {}
}
```

Error shape
```json
{
  "ok": false,
  "error": {
    "code": "INVALID_URL",
    "message": "..."
  }
}
```

## Notes
- UI ada di `public/`.
- API ada di `src/routes/api.js`.
- YouTube downloader pakai provider Clipto (`src/services/downloaders/youtube.js`).
- Rate limit:
  - `/api/v1/*`: 120 req/menit
  - `/api/v1/download/*`: 30 req/menit
- Playlist music diatur di `public/assets/app.js` (dock kanan bawah).
- Spotify search/preview pakai Spotify Web API (preview_url).
