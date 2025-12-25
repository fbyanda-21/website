# 🚀 Downloader Pro - Multi Platform Video Downloader

Website downloader video dari Instagram, TikTok, YouTube, dan Facebook tanpa watermark.

## ✨ Fitur Utama
- ✅ Download dari 4 platform populer
- ✅ Tanpa watermark
- ✅ Kualitas HD/4K
- ✅ Download audio terpisah
- ✅ Preview sebelum download
- ✅ Interface modern & responsive
- ✅ Dark/Light mode
- ✅ Tanpa registrasi

## 🛠️ Instalasi

### Option 1: Hosting Static (Mudah)
1. Upload semua file ke hosting web
2. Pastikan PHP support di server
3. Buka `index.html`

### Option 2: Local Development
1. Clone repository
2. Buka di browser dengan live server
3. Atau gunakan XAMPP/WAMP untuk PHP

## 🔧 Konfigurasi API

### 1. RapidAPI Key
Ganti API key di file `api/download.php`:
```php
define('RAPIDAPI_KEY', 'API_KEY_ANDA');

downloader-pro/
├── index.html          # Halaman utama
├── style.css          # Stylesheet
├── script.js          # JavaScript utama
├── api/
│   └── download.php   # Backend proxy
└── README.md          # Dokumentasi