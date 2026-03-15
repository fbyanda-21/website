(() => {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

  const viewEl = qs('#view');
  const routeTitleEl = qs('#routeTitle');
  const routeSubtitleEl = qs('#routeSubtitle');
  const apiStatusEl = qs('#apiStatus');
  const timeEl = qs('#currentTime');

  const sidebar = qs('#sidebar');
  const overlay = qs('#sidebarOverlay');
  const menuToggle = qs('#menuToggle');

  function setSidebar(open) {
    const shouldOpen = Boolean(open);
    sidebar.classList.toggle('active', shouldOpen);
    overlay.classList.toggle('active', shouldOpen);
  }

  menuToggle.addEventListener('click', () => setSidebar(!sidebar.classList.contains('active')));
  overlay.addEventListener('click', () => setSidebar(false));

  function isMobile() {
    return window.matchMedia('(max-width: 1023px)').matches;
  }

  function navigate(path) {
    history.pushState({}, '', path);
    renderRoute();
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-link]');
    if (!a) return;
    e.preventDefault();
    navigate(a.getAttribute('href'));
    if (isMobile()) setSidebar(false);
  });

  window.addEventListener('popstate', renderRoute);

  function setActiveNav(pathname) {
    qsa('.nav-link').forEach((a) => {
      const href = a.getAttribute('href');
      const active = href === pathname || (pathname === '/' && href === '/dashboard');
      a.classList.toggle('active', active);
    });
  }

  function updateClock() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  setInterval(updateClock, 1000);
  updateClock();

  function getApiBase() {
    const meta = qs('meta[name="api-base"]');
    const raw = meta ? String(meta.getAttribute('content') || '').trim() : '';
    if (raw) return raw.replace(/\/$/, '');
    if (window.location.protocol === 'file:') return 'https://fbyanxzz-smddl.vercel.app';
    return '';
  }

  const API_BASE = getApiBase();

  async function checkApi(attempt = 0) {
    apiStatusEl.textContent = 'checking...';
    try {
      const url = (API_BASE || '') + '/api/v1/health';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        apiStatusEl.textContent = 'online';
        apiStatusEl.style.color = 'var(--good)';
        return;
      }
      if (res.status === 429) {
        apiStatusEl.textContent = 'limited';
        apiStatusEl.style.color = 'var(--secondary)';
        return;
      }
      apiStatusEl.textContent = 'down';
      apiStatusEl.style.color = 'var(--bad)';
    } catch (e) {
      apiStatusEl.textContent = 'down';
      apiStatusEl.style.color = 'var(--bad)';
    }

    if (attempt < 2) {
      setTimeout(() => checkApi(attempt + 1), 1200);
    }
  }

  checkApi();

  // Music persistence
  const audio = qs('#bg-music');
  const musicToggle = qs('#musicToggle');
  const musicPrev = qs('#musicPrev');
  const musicNext = qs('#musicNext');
  const musicTrack = qs('#musicTrack');
  const musicDownload = qs('#musicDownload');
  const musicVolume = qs('#musicVolume');
  const musicHint = qs('#musicHint');
  const musicTitle = qs('#musicTitle');

  const TRACKS = [
    {
      id: 'death-bed',
      title: 'Death Bed',
      local: '/assets/music/01-death-bed.mp3',
      remote: 'https://files.catbox.moe/spadk5.mp3'
    },
    {
      id: 'lemon-tree',
      title: 'Lemon Tree',
      local: '/assets/music/02-lemon-tree.mp3',
      remote: 'https://files.catbox.moe/l7yjkn.mp3'
    },
    {
      id: 'surrender',
      title: 'Surrender',
      local: '/assets/music/03-surrender.mp3',
      remote: 'https://files.catbox.moe/64rrze.mp3'
    },
    {
      id: 'past-lives',
      title: 'Past Lives',
      local: '/assets/music/04-past-lives.mp3',
      remote: 'https://files.catbox.moe/rg0mtu.mp3'
    },
    {
      id: 'play-date',
      title: 'Play Date',
      local: '/assets/music/05-play-date.mp3',
      remote: 'https://files.catbox.moe/05vn8z.mp3'
    },
    {
      id: 'trouble-is-a-friend',
      title: 'Trouble Is A Friend',
      local: '/assets/music/06-trouble-is-a-friend.mp3',
      remote: 'https://files.catbox.moe/fdw8o8.mp3'
    },
    {
      id: 'rude',
      title: 'Rude',
      local: '/assets/music/07-rude.mp3',
      remote: 'https://files.catbox.moe/c6gtik.mp3'
    },
    {
      id: 'love-story-ts',
      title: 'Love Story (TS)',
      local: '/assets/music/08-love-story-ts.mp3',
      remote: 'https://files.catbox.moe/rm82lu.mp3'
    },
    {
      id: 'love-story-indila',
      title: 'Love Story (Indila)',
      local: '/assets/music/09-love-story-indila.mp3',
      remote: 'https://files.catbox.moe/mqxmmt.mp3'
    },
    {
      id: 'dusk-till-dawn',
      title: 'Dusk Till Dawn',
      local: '/assets/music/10-dusk-till-dawn.mp3',
      remote: 'https://files.catbox.moe/ulw7i2.mp3'
    },
    {
      id: 'somewhere-only-we-know',
      title: 'Somewhere Only We Know',
      local: '/assets/music/11-somewhere-only-we-know.mp3',
      remote: 'https://files.catbox.moe/c0fspy.mp3'
    },
    {
      id: 'off-my-face',
      title: 'Off My Face',
      local: '/assets/music/12-off-my-face.mp3',
      remote: 'https://files.catbox.moe/svkvc3.mp3'
    },
    {
      id: 'dandelions',
      title: 'Dandelions',
      local: '/assets/music/13-dandelions.mp3',
      remote: 'https://files.catbox.moe/kwaku9.mp3'
    }
  ];

  const musicState = {
    enabled: localStorage.getItem('bgMusic.enabled') !== '0',
    volume: Number(localStorage.getItem('bgMusic.volume') || '0.6'),
    time: Number(localStorage.getItem('bgMusic.time') || '0'),
    trackIndex: Number(localStorage.getItem('bgMusic.trackIndex') || '0')
  };

  if (!Number.isFinite(musicState.trackIndex) || musicState.trackIndex < 0) {
    musicState.trackIndex = 0;
  }
  if (musicState.trackIndex >= TRACKS.length) {
    musicState.trackIndex = 0;
  }

  audio.volume = Number.isFinite(musicState.volume) ? musicState.volume : 0.6;
  musicVolume.value = String(audio.volume);

  function setMusicUi(playing) {
    musicToggle.innerHTML = playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    musicHint.textContent = playing ? 'Sedang diputar' : 'Tap untuk mulai';
  }

  function renderTrackOptions() {
    if (!musicTrack) return;
    musicTrack.innerHTML = '';
    TRACKS.forEach((t, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = t.title;
      musicTrack.appendChild(opt);
    });
  }

  function currentTrack() {
    return TRACKS[musicState.trackIndex] || TRACKS[0];
  }

  function pickTrackSrc(track) {
    if (!track) return { src: '', kind: 'none', fallback: '' };
    return {
      src: track.local || track.remote || '',
      kind: track.local ? 'local' : 'remote',
      fallback: track.remote || ''
    };
  }

  async function setTrackIndex(nextIndex, { autoplay } = {}) {
    const wasPlaying = !audio.paused;
    musicState.trackIndex = (nextIndex + TRACKS.length) % TRACKS.length;
    localStorage.setItem('bgMusic.trackIndex', String(musicState.trackIndex));

    const t = currentTrack();
    if (musicTitle) musicTitle.textContent = t.title;
    if (musicTrack) musicTrack.value = String(musicState.trackIndex);

    const prevSrc = audio.src;
    const picked = pickTrackSrc(t);
    audio.dataset.musicFallback = picked.fallback || '';
    audio.dataset.musicKind = picked.kind;
    audio.src = picked.src;
    audio.load();

    if (prevSrc !== audio.src) {
      localStorage.setItem('bgMusic.time', '0');
    }

    if (autoplay || wasPlaying) {
      try {
        await audio.play();
        setMusicUi(true);
      } catch (e) {
        setMusicUi(false);
      }
    } else {
      setMusicUi(false);
    }
  }

  async function tryPlayMusic() {
    if (!musicState.enabled) {
      setMusicUi(false);
      return;
    }
    try {
      renderTrackOptions();
      await setTrackIndex(musicState.trackIndex, { autoplay: false });
      if (musicState.time > 0 && Number.isFinite(musicState.time)) audio.currentTime = musicState.time;
      await audio.play();
      setMusicUi(true);
    } catch (e) {
      setMusicUi(false);
      musicHint.textContent = 'Klik sekali untuk izin autoplay';
    }
  }

  document.addEventListener(
    'click',
    () => {
      if (audio.paused && musicState.enabled) {
        audio.play().then(() => setMusicUi(true)).catch(() => {});
      }
    },
    { once: true }
  );

  musicToggle.addEventListener('click', async () => {
    if (!audio.paused) {
      audio.pause();
      musicState.enabled = false;
      localStorage.setItem('bgMusic.enabled', '0');
      setMusicUi(false);
      return;
    }
    musicState.enabled = true;
    localStorage.setItem('bgMusic.enabled', '1');
    try {
      if (!audio.src) await setTrackIndex(musicState.trackIndex, { autoplay: false });
      await audio.play();
      setMusicUi(true);
    } catch (e) {
      setMusicUi(false);
      musicHint.textContent = 'Autoplay diblokir (tap di halaman)';
    }
  });

  if (musicPrev) {
    musicPrev.addEventListener('click', async () => {
      await setTrackIndex(musicState.trackIndex - 1, { autoplay: true });
    });
  }

  if (musicNext) {
    musicNext.addEventListener('click', async () => {
      await setTrackIndex(musicState.trackIndex + 1, { autoplay: true });
    });
  }

  if (musicTrack) {
    renderTrackOptions();
    musicTrack.addEventListener('change', async () => {
      const idx = Number(musicTrack.value);
      if (!Number.isFinite(idx)) return;
      await setTrackIndex(idx, { autoplay: true });
    });
  }

  if (musicDownload) {
    musicDownload.addEventListener('click', async () => {
      const t = currentTrack();
      const safe = t.id.replace(/[^a-z0-9-]/gi, '-');
      const src = audio.currentSrc || audio.src || t.local || t.remote;
      await downloadFile(src, `music-${safe}.mp3`);
    });
  }

  musicVolume.addEventListener('input', () => {
    audio.volume = Number(musicVolume.value);
    localStorage.setItem('bgMusic.volume', String(audio.volume));
  });

  setInterval(() => {
    if (!audio.paused && Number.isFinite(audio.currentTime)) {
      localStorage.setItem('bgMusic.time', String(audio.currentTime));
    }
  }, 5000);

  window.addEventListener('beforeunload', () => {
    if (Number.isFinite(audio.currentTime)) {
      localStorage.setItem('bgMusic.time', String(audio.currentTime));
    }
  });

  audio.addEventListener('ended', async () => {
    await setTrackIndex(musicState.trackIndex + 1, { autoplay: true });
  });

  audio.addEventListener('error', async () => {
    const kind = audio.dataset.musicKind || '';
    const fallback = audio.dataset.musicFallback || '';
    if (kind === 'local' && fallback) {
      audio.dataset.musicKind = 'remote';
      audio.src = fallback;
      audio.load();
      if (musicState.enabled) {
        try {
          await audio.play();
          setMusicUi(true);
          musicHint.textContent = 'Sedang diputar (remote)';
          return;
        } catch (e) {
          // ignore
        }
      }
    }
    musicHint.textContent = 'Track tidak bisa diputar';
    setMusicUi(false);
  });

  tryPlayMusic();

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined) node.setAttribute(k, String(v));
    });
    for (const c of children) node.append(c);
    return node;
  }

  function setView(title, subtitle, node) {
    routeTitleEl.textContent = title;
    routeSubtitleEl.textContent = subtitle;
    viewEl.innerHTML = '';
    viewEl.append(node);
  }

  function dashboardView() {
    const hero = el('div', { class: 'card hero' }, [
      el('div', { class: 'card-inner' }, [
        el('h2', { class: 'title', html: '<i class="fas fa-download"></i> Downloader serba ada' }),
        el('p', {
          class: 'subtitle',
          html:
            'Satu dashboard untuk TikTok, Instagram, YouTube, dan Facebook. Pindah halaman tanpa memutus background music.'
        })
      ])
    ]);

    const actions = el('div', { class: 'card' }, [
      el('div', { class: 'card-inner' }, [
        el('div', { class: 'title', html: '<i class="fas fa-rocket"></i> Quick Actions' }),
        el('div', { class: 'actions' }, [
          quickBtn('TikTok', 'fab fa-tiktok', '/tiktok'),
          quickBtn('Instagram', 'fab fa-instagram', '/instagram'),
          quickBtn('YouTube', 'fab fa-youtube', '/youtube'),
          quickBtn('Facebook', 'fab fa-facebook', '/facebook'),
          quickBtn('QR Generator', 'fas fa-qrcode', '/qr-generator')
        ])
      ])
    ]);

    return el('div', { class: 'grid' }, [hero, actions]);
  }

  function quickBtn(label, iconClass, path) {
    return el(
      'button',
      {
        class: 'action-btn',
        onclick: () => navigate(path),
        type: 'button'
      },
      [el('i', { class: iconClass }), el('span', { html: label })]
    );
  }

  function qrView() {
    const input = el('input', {
      class: 'input',
      placeholder: 'Teks / URL yang mau dijadiin QR',
      value: ''
    });
    const out = el('div', { class: 'card', style: 'display:none' });
    const outInner = el('div', { class: 'card-inner' });
    out.append(outInner);

    const notice = el('div', { class: 'notice error' });
    const btn = el(
      'button',
      {
        class: 'primary-btn',
        type: 'button',
        onclick: () => {
          const value = input.value.trim();
          notice.style.display = 'none';
          out.style.display = 'none';
          outInner.innerHTML = '';
          if (!value) {
            notice.textContent = 'Error: isi dulu teks/URL nya.';
            notice.style.display = 'block';
            return;
          }
          if (!window.QRCode) {
            notice.textContent = 'Error: library QR belum siap. Refresh halaman.';
            notice.style.display = 'block';
            return;
          }
          const container = el('div');
          outInner.append(el('div', { class: 'title', html: '<i class="fas fa-qrcode"></i> QR kamu' }));
          outInner.append(container);
          new window.QRCode(container, {
            text: value,
            width: 220,
            height: 220,
            colorDark: '#ffffff',
            colorLight: '#000000',
            correctLevel: window.QRCode.CorrectLevel.H
          });
          out.style.display = 'block';
        }
      },
      [el('i', { class: 'fas fa-bolt' }), el('span', { html: 'Generate QR' })]
    );

    return el('div', { class: 'card' }, [
      el('div', { class: 'card-inner' }, [
        el('h2', { class: 'title', html: '<i class="fas fa-qrcode"></i> QR Generator' }),
        el('div', { class: 'form' }, [
          el('div', { class: 'label', html: 'Masukkan teks / link' }),
          input,
          btn,
          notice,
          out
        ])
      ])
    ]);
  }

  function isValidUrl(url) {
    return /^https?:\/\//i.test(url);
  }

  async function apiGet(path, params) {
    const base = API_BASE || window.location.origin;
    const url = new URL(path, base);
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString(), { cache: 'no-store' });
    const contentType = String(res.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      const hint = text && text.length ? `Non-JSON response (status ${res.status}).` : `HTTP ${res.status}`;
      const err = new Error(hint);
      err.code = 'API_INVALID_RESPONSE';
      throw err;
    }
    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.ok !== true) {
      const msg = json?.error?.message || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.code = json?.error?.code || 'API_ERROR';
      throw err;
    }
    return json.result;
  }

  async function downloadFile(url, filename) {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        headers: { Accept: 'video/mp4,audio/mpeg,*/*' }
      });
      if (!response.ok) throw new Error('Gagal mengambil file');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      return true;
    } catch (e) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return false;
    }
  }

  function downloaderView(cfg) {
    const input = el('input', {
      class: 'input',
      placeholder: cfg.placeholder
    });
    const noticeErr = el('div', { class: 'notice error' });
    const noticeOk = el('div', { class: 'notice success' });
    const progress = el('div', { class: 'progress' }, [el('div')]);
    const resultWrap = el('div', { class: 'result' });

    const qualitySelect = cfg.quality
      ? el('select', { class: 'input' }, [
          el('option', { value: '1080', html: '1080p' }),
          el('option', { value: '720', html: '720p' }),
          el('option', { value: '480', html: '480p' }),
          el('option', { value: '360', html: '360p' })
        ])
      : null;
    if (qualitySelect) qualitySelect.value = '720';

    const btn = el(
      'button',
      {
        class: 'primary-btn',
        type: 'button'
      },
      [el('i', { class: 'fas fa-download' }), el('span', { html: `Proses ${cfg.label}` })]
    );

    function setLoading(loading, pct, text) {
      btn.disabled = loading;
      btn.innerHTML = loading
        ? '<i class="fas fa-spinner fa-spin"></i> Memproses...'
        : '<i class="fas fa-download"></i> Proses ' + cfg.label;
      progress.style.display = loading ? 'block' : 'none';
      progress.firstElementChild.style.width = loading ? `${pct || 35}%` : '0%';
      if (text) {
        noticeOk.textContent = 'Info: ' + text;
        noticeOk.style.display = loading ? 'block' : 'none';
      } else {
        noticeOk.style.display = 'none';
      }
    }

    function showError(msg) {
      noticeErr.textContent = 'Error: ' + msg;
      noticeErr.style.display = 'block';
      noticeOk.style.display = 'none';
    }

    function clearNotices() {
      noticeErr.style.display = 'none';
      noticeOk.style.display = 'none';
    }

    function renderResult(result) {
      resultWrap.innerHTML = '';
      resultWrap.style.display = 'block';

      const titleText = result.title || cfg.label;

      const title = el('div', { class: 'title', html: `<i class="${cfg.icon}"></i> ${escapeHtml(titleText)}` });
      resultWrap.append(title);

      if (result.type === 'photo' && Array.isArray(result.images)) {
        const dl = el('div', { class: 'dl-grid' });
        result.images.slice(0, 12).forEach((u, idx) => {
          dl.append(
            dlItem('Photo', `Image ${idx + 1}`, u, () => downloadFile(u, `tiktok-photo-${idx + 1}.jpg`))
          );
        });
        if (result.music) {
          dl.append(dlItem('Audio', 'MP3', result.music, () => downloadFile(result.music, `tiktok-audio.mp3`)));
        }
        resultWrap.append(dl);
        return;
      }

      const videoUrl = result.video || '';
      if (videoUrl) {
        const prev = el('div', { class: 'preview' }, [el('video', { controls: 'true', src: videoUrl })]);
        resultWrap.append(prev);
      }

      const dl = el('div', { class: 'dl-grid' });
      if (result.videos && Array.isArray(result.videos) && result.videos.length) {
        result.videos.slice(0, 8).forEach((v) => {
          dl.append(
            dlItem('Video', v.quality || 'video', v.url, () =>
              downloadFile(v.url, `${cfg.slug}-video-${(v.quality || 'q').replace(/\s+/g, '-')}.mp4`)
            )
          );
        });
      } else if (videoUrl) {
        dl.append(dlItem('Video', cfg.label, videoUrl, () => downloadFile(videoUrl, `${cfg.slug}-video.mp4`)));
      }

      if (result.music) {
        dl.append(dlItem('Audio', 'MP3', result.music, () => downloadFile(result.music, `${cfg.slug}-audio.mp3`)));
      }

      if (result.items && Array.isArray(result.items)) {
        result.items.slice(0, 10).forEach((it, idx) => {
          dl.append(
            dlItem('Media', it.label || `Item ${idx + 1}`, it.url, () =>
              downloadFile(it.url, `${cfg.slug}-media-${idx + 1}`)
            )
          );
        });
      }

      if (!dl.childElementCount) {
        dl.append(el('div', { class: 'subtitle', html: 'Tidak ada link download yang bisa ditampilkan.' }));
      }

      resultWrap.append(dl);
    }

    btn.addEventListener('click', async () => {
      clearNotices();
      resultWrap.style.display = 'none';
      resultWrap.innerHTML = '';

      const url = input.value.trim();
      if (!url) return showError('Masukkan URL terlebih dahulu.');
      if (!isValidUrl(url)) return showError('URL harus diawali http/https.');
      if (cfg.validate && !cfg.validate(url)) return showError('URL tidak valid untuk ' + cfg.label + '.');

      setLoading(true, 30, 'Menghubungi server...');
      try {
        const q = qualitySelect ? qualitySelect.value : '';
        const data = await apiGet(cfg.apiPath, { url, quality: q });
        progress.firstElementChild.style.width = '100%';
        noticeOk.textContent = 'OK: selesai. Silakan preview / download.';
        noticeOk.style.display = 'block';
        renderResult(data);
      } catch (e) {
        showError(e.message || 'Gagal memproses.');
      } finally {
        setTimeout(() => setLoading(false), 250);
      }
    });

    const formChildren = [
      el('div', { class: 'label', html: `<i class="fas fa-link"></i> Masukkan URL ${cfg.label}` }),
      input
    ];
    if (qualitySelect) {
      formChildren.push(el('div', { class: 'label', html: '<i class="fas fa-sliders"></i> Kualitas video (opsional)' }));
      formChildren.push(qualitySelect);
    }
    formChildren.push(btn, progress, noticeErr, noticeOk, resultWrap);

    return el('div', { class: 'card' }, [
      el('div', { class: 'card-inner' }, [
        el('h2', { class: 'title', html: `<i class="${cfg.icon}"></i> ${cfg.label} Downloader` }),
        el('div', { class: 'form' }, formChildren)
      ])
    ]);
  }

  function dlItem(tag, name, url, onDownload) {
    const a = el('a', {
      href: url,
      target: '_blank',
      rel: 'noreferrer',
      onclick: async (e) => {
        e.preventDefault();
        await onDownload();
      }
    });
    a.innerHTML = '<i class="fas fa-download"></i><span>Download</span>';
    return el('div', { class: 'dl-item' }, [
      el('div', { class: 'left' }, [
        el('span', { class: 'tag', html: escapeHtml(tag) }),
        el('span', { class: 'name', title: url, html: escapeHtml(name) })
      ]),
      a
    ]);
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  const routes = [
    {
      path: '/',
      title: 'Dashboard',
      subtitle: 'Dashboard',
      render: () => dashboardView()
    },
    {
      path: '/dashboard',
      title: 'Dashboard',
      subtitle: 'Dashboard',
      render: () => dashboardView()
    },
    {
      path: '/qr-generator',
      title: 'QR Generator',
      subtitle: 'Tools',
      render: () => qrView()
    },
    {
      path: '/music',
      title: 'Music Search',
      subtitle: 'Spotify Preview',
      render: () => spotifyView()
    },
    {
      path: '/tiktok',
      title: 'TikTok',
      subtitle: 'Downloader',
      render: () =>
        downloaderView({
          slug: 'tiktok',
          label: 'TikTok',
          icon: 'fab fa-tiktok',
          placeholder: 'https://www.tiktok.com/@user/video/....',
          apiPath: '/api/v1/download/tiktok',
          validate: (u) => /tiktok\.com\//i.test(u)
        })
    },
    {
      path: '/instagram',
      title: 'Instagram',
      subtitle: 'Downloader',
      render: () =>
        downloaderView({
          slug: 'instagram',
          label: 'Instagram',
          icon: 'fab fa-instagram',
          placeholder: 'https://www.instagram.com/reel/...',
          apiPath: '/api/v1/download/instagram',
          validate: (u) => /instagram\.com\//i.test(u) || /instagr\.am\//i.test(u)
        })
    },
    {
      path: '/youtube',
      title: 'YouTube',
      subtitle: 'Downloader',
      render: () =>
        downloaderView({
          slug: 'youtube',
          label: 'YouTube',
          icon: 'fab fa-youtube',
          placeholder: 'https://youtu.be/... atau https://www.youtube.com/watch?v=...',
          apiPath: '/api/v1/download/youtube',
          quality: true,
          validate: (u) => /youtu\.be\//i.test(u) || /youtube\.com\/watch\?v=/i.test(u)
        })
    },
    {
      path: '/facebook',
      title: 'Facebook',
      subtitle: 'Downloader',
      render: () =>
        downloaderView({
          slug: 'facebook',
          label: 'Facebook',
          icon: 'fab fa-facebook',
          placeholder: 'https://www.facebook.com/watch/... atau fb.watch/...',
          apiPath: '/api/v1/download/facebook',
          validate: (u) => /facebook\.com\//i.test(u) || /fb\.watch\//i.test(u)
        })
    }
  ];

  function renderRoute() {
    const pathname = window.location.pathname || '/';
    const match = routes.find((r) => r.path === pathname) || routes[0];
    setActiveNav(match.path);
    setView(match.title, match.subtitle, match.render());
  }

  renderRoute();

  function spotifyView() {
    const input = el('input', { class: 'input', placeholder: 'Cari lagu / artist (Spotify)', value: '' });
    const notice = el('div', { class: 'notice error' });
    const ok = el('div', { class: 'notice success' });
    const results = el('div', { class: 'dl-grid' });

    const playerWrap = el('div', { class: 'card', style: 'margin-top:12px; display:none;' });
    const playerInner = el('div', { class: 'card-inner' });
    playerWrap.append(playerInner);
    const audioPrev = document.createElement('audio');
    audioPrev.controls = true;
    audioPrev.preload = 'none';
    audioPrev.style.width = '100%';

    let current = null;

    function setError(msg) {
      notice.textContent = 'Error: ' + msg;
      notice.style.display = 'block';
      ok.style.display = 'none';
    }

    function setOk(msg) {
      ok.textContent = 'OK: ' + msg;
      ok.style.display = 'block';
      notice.style.display = 'none';
    }

    function clearMessages() {
      notice.style.display = 'none';
      ok.style.display = 'none';
    }

    function renderPlayer(track) {
      current = track;
      playerInner.innerHTML = '';

      const header = el('div', { class: 'title', html: `<i class="fab fa-spotify"></i> ${escapeHtml(track.title)}` });
      const sub = el('div', { class: 'subtitle', html: `${escapeHtml(track.artist)} • ${escapeHtml(track.duration)}` });

      const actions = el('div', { class: 'dl-grid' });
      if (track.external_url) {
        const open = el('a', { href: track.external_url, target: '_blank', rel: 'noreferrer' });
        open.innerHTML = '<i class="fas fa-external-link-alt"></i><span>Buka di Spotify</span>';
        actions.append(el('div', { class: 'dl-item' }, [
          el('div', { class: 'left' }, [
            el('span', { class: 'tag', html: 'Link' }),
            el('span', { class: 'name', html: 'Spotify' })
          ]),
          open
        ]));
      }

      playerInner.append(header, sub);

      if (track.preview_url) {
        audioPrev.src = track.preview_url;
        playerInner.append(el('div', { class: 'subtitle', html: 'Preview (30s)'}));
        playerInner.append(audioPrev);
      } else {
        playerInner.append(el('div', { class: 'subtitle', html: 'Track ini tidak punya preview_url.' }));
      }

      if (actions.childElementCount) playerInner.append(actions);
      playerWrap.style.display = 'block';
    }

    async function doSearch() {
      clearMessages();
      results.innerHTML = '';
      playerWrap.style.display = 'none';

      const q = input.value.trim();
      if (!q) return setError('Isi kata kunci dulu.');

      setOk('Mencari...');
      try {
        const data = await apiGet('/api/v1/music/spotify/search', { q, limit: 10 });
        const items = Array.isArray(data.items) ? data.items : [];
        if (!items.length) {
          ok.style.display = 'none';
          return setError('Tidak ada hasil.');
        }

        ok.style.display = 'none';

        items.forEach((t) => {
          const playBtn = el('a', {
            href: '#',
            onclick: (e) => {
              e.preventDefault();
              renderPlayer(t);
              if (t.preview_url) {
                audioPrev.play().catch(() => {});
              }
            }
          });
          playBtn.innerHTML = '<i class="fas fa-play"></i><span>Preview</span>';

          const tag = t.preview_url ? 'Preview' : 'No preview';
          results.append(el('div', { class: 'dl-item' }, [
            el('div', { class: 'left' }, [
              el('span', { class: 'tag', html: escapeHtml(tag) }),
              el('span', { class: 'name', title: `${t.title} - ${t.artist}`, html: `${escapeHtml(t.title)} - ${escapeHtml(t.artist)}` })
            ]),
            playBtn
          ]));
        });
      } catch (e) {
        setError(e.message || 'Gagal search.');
      }
    }

    const btn = el('button', { class: 'primary-btn', type: 'button', onclick: doSearch }, [
      el('i', { class: 'fas fa-search' }),
      el('span', { html: 'Cari di Spotify' })
    ]);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });

    return el('div', { class: 'card' }, [
      el('div', { class: 'card-inner' }, [
        el('h2', { class: 'title', html: '<i class="fas fa-music"></i> Music Search (Spotify)' }),
        el('p', { class: 'subtitle', html: 'Mode aman: preview_url (cuplikan 30 detik) + link ke Spotify.' }),
        el('div', { class: 'form' }, [
          el('div', { class: 'label', html: '<i class="fas fa-keyboard"></i> Kata kunci' }),
          input,
          btn,
          notice,
          ok,
          results,
          playerWrap
        ])
      ])
    ]);
  }
})();
