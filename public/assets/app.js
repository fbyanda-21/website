(() => {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

  const viewEl = qs('#view');
  const routeTitleEl = qs('#routeTitle');
  const spotifyFab = qs('#spotifyFab');
  const spotifyFabImg = qs('#spotifyFabImg');

  function navigate(path) {
    history.pushState({}, '', path);
    renderRoute();
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-link]');
    if (!a) return;
    e.preventDefault();
    navigate(a.getAttribute('href'));
  });

  window.addEventListener('popstate', renderRoute);

  function setActiveNav(pathname) {
    const p = pathname === '/' ? '/dashboard' : pathname;
    const group = (path) => {
      if (path === '/dashboard') return '/dashboard';
      if (path === '/tiktok') return '/tiktok';
      if (path === '/instagram') return '/instagram';
      if (path === '/youtube') return '/youtube';
      if (['/more', '/facebook', '/qr-generator', '/spotify'].includes(path)) return '/more';
      return '/dashboard';
    };

    const activeGroup = group(p);
    qsa('.nav-btn').forEach((a) => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === activeGroup);
    });
  }

  function getApiBase() {
    const meta = qs('meta[name="api-base"]');
    const raw = meta ? String(meta.getAttribute('content') || '').trim() : '';
    if (raw) return raw.replace(/\/$/, '');
    if (window.location.protocol === 'file:') return 'https://fbyanxzz-smddl.vercel.app';
    return '';
  }

  const API_BASE = getApiBase();

  const fabState = {
    timer: null,
    active: false
  };

  function showActivity(text, kind, { sticky } = {}) {
    // Kept for internal calls; represented via FAB state.
    if (!spotifyFab) return;
    const label = String(text || '').trim() || 'Spotify';
    spotifyFab.setAttribute('aria-label', label);
    spotifyFab.title = label;
    spotifyFab.dataset.active = kind === 'info' ? '1' : '0';
    fabState.active = spotifyFab.dataset.active === '1';

    if (fabState.timer) window.clearTimeout(fabState.timer);
    if (!sticky) {
      fabState.timer = window.setTimeout(() => {
        spotifyFab.dataset.active = '0';
        fabState.active = false;
      }, 2500);
    }
  }

  function handleFabClick() {
    if (window.__spotifyPlayerToggle && typeof window.__spotifyPlayerToggle === 'function') return window.__spotifyPlayerToggle();
    return navigate('/spotify');
  }

  if (spotifyFab) spotifyFab.addEventListener('click', handleFabClick);

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

  function filenameSafe(s) {
    return String(s || '')
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, ' ')
      .slice(0, 120);
  }

  function setFabCover(url) {
    if (!spotifyFab || !spotifyFabImg) return;
    const u = String(url || '').trim();
    if (u) {
      spotifyFab.dataset.cover = '1';
      spotifyFabImg.src = u;
      return;
    }
    spotifyFab.dataset.cover = '0';
    spotifyFabImg.src = '/assets/img/spotify.svg';
  }

  function setView(title, node) {
    routeTitleEl.textContent = title;
    viewEl.innerHTML = '';
    viewEl.append(node);
  }

  function dashboardView() {
    const hero = el('div', { class: 'panel hero' }, [
      el('h2', { class: 'title', html: 'Downloader' }),
      el('p', {
        class: 'subtitle',
        html: 'Pilih platform, paste link, proses, lalu download.'
      }),
      el('div', { class: 'actions' }, [
        quickBtn('TikTok', 'fab fa-tiktok', '/tiktok'),
        quickBtn('Instagram', 'fab fa-instagram', '/instagram'),
        quickBtn('YouTube', 'fab fa-youtube', '/youtube')
      ])
    ]);

    const other = el('div', { class: 'panel' }, [
      el('div', { class: 'title', html: 'Lainnya' }),
      el('div', { class: 'actions' }, [
        quickBtn('Facebook', 'fab fa-facebook', '/facebook'),
        quickBtn('QR', 'fas fa-qrcode', '/qr-generator'),
        quickBtn('Spotify', 'fab fa-spotify', '/spotify')
      ])
    ]);

    return el('div', { class: 'grid' }, [hero, other]);
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
    const out = el('div', { class: 'panel', style: 'display:none' });
    const outInner = el('div');
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

    return el('div', { class: 'panel' }, [
      el('h2', { class: 'title', html: 'QR Generator' }),
      el('div', { class: 'form' }, [
        el('div', { class: 'label', html: 'Masukkan teks / link' }),
        input,
        btn,
        notice,
        out
      ])
    ]);
  }

  function moreView() {
    return el('div', { class: 'panel' }, [
      el('h2', { class: 'title', html: 'More' }),
      el('p', { class: 'subtitle', html: 'Tools tambahan.' }),
      el('div', { class: 'actions' }, [
        quickBtn('Spotify', 'fab fa-spotify', '/spotify'),
        quickBtn('Facebook', 'fab fa-facebook', '/facebook'),
        quickBtn('QR Generator', 'fas fa-qrcode', '/qr-generator')
      ])
    ]);
  }

  const spotifyPlayer = (() => {
    const UPLOAD_URL = 'https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk';

    const CACHE_KEY = 'spotify-upload-cache-v1';
    function loadCache() {
      try {
        const raw = window.localStorage.getItem(CACHE_KEY);
        const obj = raw ? JSON.parse(raw) : null;
        return obj && typeof obj === 'object' ? obj : {};
      } catch {
        return {};
      }
    }

    function saveCache(obj) {
      try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(obj || {}));
      } catch {}
    }

    const audio = new Audio();
    audio.preload = 'none';

    const state = {
      open: false,
      loading: false,
      track: null,
      queue: [],
      index: -1,
      streamUrl: '',
      raf: 0,
      uploadCache: loadCache(),
      needsFile: false
    };

    const overlay = el('div', { class: 'np-overlay' });
    const sheet = el('div', { class: 'np-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Now Playing' });

    const npTitle = el('div', { class: 's-brand' }, [
      el('img', { class: 's-logo', src: '/assets/img/spotify.svg', alt: 'Spotify' }),
      el('div', { class: 'tiny muted', html: 'Now Playing' })
    ]);

    const btnClose = el(
      'button',
      { class: 'np-close', type: 'button', 'aria-label': 'Close' },
      [el('i', { class: 'fas fa-xmark' })]
    );

    const artImg = el('img', { alt: 'Cover' });
    const art = el('div', { class: 'np-art' }, [artImg]);
    const titleWrap = el('div', { class: 'np-meta' }, [
      el('p', { class: 'np-title', html: 'Track' }),
      el('div', { class: 'np-sub', html: 'Ready' })
    ]);

    const barFill = el('div');
    const bar = el('div', { class: 'np-bar' }, [barFill]);
    const seek = el('input', { class: 'np-seek', type: 'range', min: '0', max: '1000', value: '0' });
    const timeL = el('span', { html: '0:00' });
    const timeR = el('span', { html: '0:00' });
    const timeRow = el('div', { class: 'np-time' }, [timeL, timeR]);

    const btnPrev = el('button', { class: 'np-skip', type: 'button', 'aria-label': 'Previous', disabled: true }, [
      el('i', { class: 'fas fa-backward-step' })
    ]);

    const btnPlay = el('button', { class: 'np-play', type: 'button', disabled: true });
    btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';

    const btnNext = el('button', { class: 'np-skip', type: 'button', 'aria-label': 'Next', disabled: true }, [
      el('i', { class: 'fas fa-forward-step' })
    ]);

    const transport = el('div', { class: 'np-transport' }, [btnPrev, btnPlay, btnNext]);

    const volIconL = el('i', { class: 'fas fa-volume-low', 'aria-hidden': 'true' });
    const volIconR = el('i', { class: 'fas fa-volume-high', 'aria-hidden': 'true' });
    const vol = el('input', { class: 'np-vol', type: 'range', min: '0', max: '100', value: String(Math.round((audio.volume || 1) * 100)) });
    const volRow = el('div', { class: 'np-volrow' }, [volIconL, vol, volIconR]);

    const btnDownload = el('button', { class: 's-btn primary', type: 'button' }, [
      el('i', { class: 'fas fa-download' }),
      el('span', { html: 'Download' })
    ]);

    const uploadInput = el('input', { type: 'file', accept: 'audio/*', hidden: 'true' });

    const btnOpen = el('a', { class: 's-btn ghost', href: '#', target: '_blank', rel: 'noreferrer' }, [
      el('i', { class: 'fas fa-arrow-up-right-from-square' }),
      el('span', { html: 'Open' })
    ]);

    const hint = el('p', { class: 's-hint', html: 'Tap Play. Drag untuk seek, slider untuk volume.' });

    sheet.append(
      el('div', { class: 'np-top' }, [npTitle, btnClose]),
      el('div', { class: 'np-grab', 'aria-hidden': 'true' }),
      el('div', { class: 'np-body' }, [
        art,
        el('div', {}, [
          titleWrap,
          el('div', { class: 'np-progress' }, [bar, seek, timeRow]),
          el('div', { class: 'np-controls' }, [transport, volRow, hint]),
          el('div', { class: 'np-actions' }, [btnDownload, btnOpen])
        ])
      ])
    );

    let mounted = false;
    function ensureMounted() {
      if (mounted) return;
      overlay.append(sheet);
      sheet.addEventListener('click', (e) => e.stopPropagation());
      overlay.append(uploadInput);
      document.body.append(overlay);
      mounted = true;
    }

    function fmtTime(sec) {
      const n = Math.max(0, Math.floor(Number(sec) || 0));
      const m = Math.floor(n / 60);
      const s = n % 60;
      return `${m}:${String(s).padStart(2, '0')}`;
    }

    function applyQueueUi() {
      const hasQueue = Array.isArray(state.queue) && state.queue.length > 1;
      const i = Number(state.index);
      btnPrev.disabled = !(hasQueue && i > 0);
      btnNext.disabled = !(hasQueue && i >= 0 && i < state.queue.length - 1);
    }

    function updateProgress() {
      if (!state.open) return;
      const cur = Number(audio.currentTime || 0);
      const dur = Number(audio.duration || 0);
      timeL.textContent = fmtTime(cur);
      timeR.textContent = Number.isFinite(dur) && dur > 0 ? fmtTime(dur) : '0:00';
      const pct = dur > 0 ? Math.min(100, Math.max(0, (cur / dur) * 100)) : 0;
      barFill.style.width = pct.toFixed(2) + '%';
      seek.value = dur > 0 ? String(Math.round((cur / dur) * 1000)) : '0';
      state.raf = window.requestAnimationFrame(updateProgress);
    }

    function setUiForTrack(t) {
      const title = String(t?.title || 'Track');
      const artist = String(t?.artist || '');
      const album = String(t?.album || '');
      const subtitle = [artist, album].filter(Boolean).join(' • ') || ' ';
      titleWrap.querySelector('.np-title').textContent = title;
      titleWrap.querySelector('.np-sub').textContent = subtitle;
      artImg.src = t?.thumbnail || '/assets/img/logo.jpg';
      btnOpen.href = t?.url || '#';
      btnOpen.style.pointerEvents = t?.url ? 'auto' : 'none';
      btnOpen.style.opacity = t?.url ? '1' : '0.6';
    }

    function cacheKeyForTrack(t) {
      const url = String(t?.url || '').trim();
      if (url) return `url:${url}`;
      const title = String(t?.title || '').trim();
      const artist = String(t?.artist || '').trim();
      if (title || artist) return `meta:${title}::${artist}`;
      return '';
    }

    function applyCachedUploadIfAny(track) {
      const key = cacheKeyForTrack(track);
      if (!key) return false;
      const hit = state.uploadCache[key];
      const path = String(hit?.path || '').trim();
      if (!path) return false;

      state.streamUrl = path;
      state.needsFile = false;
      btnPlay.disabled = false;
      btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
      btnDownload.disabled = false;
      btnDownload.innerHTML = '<i class="fas fa-download"></i><span>Download</span>';
      hint.textContent = 'Ready (cached upload). Tap Play.';
      return true;
    }

    async function playUrl(u) {
      if (!u) return;
      if (audio.src !== u) audio.src = u;
      try {
        await audio.play();
        btnPlay.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
        showActivity('Now Playing', 'info', { sticky: true });
      } catch {
        btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
        showActivity('Tap to play', 'success');
      }
    }

    async function resolveStream(t) {
      state.loading = true;
      showActivity('Preparing playback...', 'info', { sticky: true });

      // Prefer previously uploaded copy (user-provided).
      if (applyCachedUploadIfAny(t)) {
        state.loading = false;
        showActivity('Ready', 'success');
        return;
      }

      const preferred = String(t?.preview || '').trim();
      if (preferred) {
        state.streamUrl = preferred;
        state.needsFile = false;
        btnDownload.disabled = false;
        btnDownload.innerHTML = '<i class="fas fa-download"></i><span>Download</span>';
        btnPlay.disabled = false;
        btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
        state.loading = false;
        showActivity('Ready', 'success');
        await playUrl(preferred);
        return;
      }

      try {
        const info = await apiGet('/spotify/download', { url: t?.url || '' });
        const u = String(info.download || '').trim();
        if (!u) throw new Error('Download link not available');
        state.streamUrl = u;
        state.needsFile = false;

        btnDownload.disabled = false;
        btnDownload.innerHTML = '<i class="fas fa-download"></i><span>Download</span>';
        btnPlay.disabled = false;
        btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
        state.loading = false;
        showActivity('Ready', 'success');

        const sub = [info.artist, info.album].filter(Boolean).join(' • ');
        if (info.title) titleWrap.querySelector('.np-title').textContent = info.title;
        if (sub) titleWrap.querySelector('.np-sub').textContent = sub;
        if (info.thumbnail) artImg.src = info.thumbnail;

        await playUrl(u);
      } catch {
        state.loading = false;
        state.streamUrl = '';
        state.needsFile = true;
        btnPlay.disabled = false;
        btnPlay.innerHTML = '<i class="fas fa-cloud-arrow-up"></i><span>Choose MP3</span>';
        btnDownload.disabled = true;
        btnDownload.innerHTML = '<i class="fas fa-triangle-exclamation"></i><span>Failed</span>';
        hint.textContent = 'Pilih file MP3 dari device, akan di-upload lalu diputar full.';
        showActivity('Need local file', 'error');
      }
    }

    function openFromQueue(idx) {
      const i = Number(idx);
      if (!Array.isArray(state.queue) || !state.queue.length) return;
      if (!Number.isFinite(i) || i < 0 || i >= state.queue.length) return;
      state.index = i;
      applyQueueUi();
      open(state.queue[i]);
    }

    function open(track, opts = {}) {
      ensureMounted();
      overlay.style.display = '';
      if (opts && Array.isArray(opts.queue)) state.queue = opts.queue;
      if (opts && Number.isFinite(Number(opts.index))) state.index = Number(opts.index);
      applyQueueUi();

      state.track = track;
      setUiForTrack(track);

      state.open = true;
      overlay.classList.add('open');
      sheet.classList.add('open');

      btnPlay.disabled = true;
      btnDownload.disabled = true;
      btnDownload.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Preparing...</span>';
      btnPlay.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Loading...</span>';
      hint.textContent = 'Tap Play. Drag untuk seek, slider untuk volume.';

      resolveStream(track).catch(() => {});
      if (state.raf) window.cancelAnimationFrame(state.raf);
      state.raf = window.requestAnimationFrame(updateProgress);
    }

    function close() {
      state.open = false;
      overlay.classList.remove('open');
      sheet.classList.remove('open');
      window.setTimeout(() => {
        if (!state.open) overlay.style.display = 'none';
      }, 220);
      if (state.raf) window.cancelAnimationFrame(state.raf);
      state.raf = 0;
    }

    function toggle() {
      if (state.open) return close();
      if (state.track) return open(state.track);
      return navigate('/spotify');
    }

    function togglePlay() {
      if (!state.streamUrl) {
        // Must be triggered by user gesture.
        uploadInput.value = '';
        uploadInput.click();
        return;
      }

      if (audio.paused) playUrl(state.streamUrl);
      else {
        audio.pause();
        btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
        showActivity('Paused', 'success');
      }
    }

    // Events
    overlay.addEventListener('click', close);
    btnClose.addEventListener('click', close);
    btnPlay.addEventListener('click', togglePlay);
    btnPrev.addEventListener('click', () => openFromQueue(state.index - 1));
    btnNext.addEventListener('click', () => openFromQueue(state.index + 1));

    vol.addEventListener('input', () => {
      audio.volume = Math.max(0, Math.min(1, Number(vol.value) / 100));
    });

    seek.addEventListener('input', () => {
      const dur = Number(audio.duration || 0);
      if (!Number.isFinite(dur) || dur <= 0) return;
      const pct = Math.max(0, Math.min(1, Number(seek.value) / 1000));
      audio.currentTime = dur * pct;
    });

    btnDownload.addEventListener('click', async () => {
      if (!state.streamUrl) return;
      showActivity('Downloading...', 'info', { sticky: true });
      const t = state.track || {};
      await downloadFile(state.streamUrl, `${filenameSafe(`${t.title || 'spotify'} - ${t.artist || ''}`) || 'spotify-download'}.mp3`);
      showActivity('Download ready', 'success');
    });

    async function uploadAndPlay(file) {
      if (!file) return;
      showActivity('Uploading audio...', 'info', { sticky: true });
      btnPlay.disabled = true;
      btnPlay.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Uploading...</span>';

      try {
        const fd = new FormData();
        fd.append('file', file, file.name || 'audio');
        const res = await fetch(UPLOAD_URL, { method: 'POST', body: fd });
        const ct = String(res.headers.get('content-type') || '');
        const data = ct.includes('application/json') ? await res.json() : null;
        if (!res.ok || !data || data.status !== true || !data.path) {
          throw new Error(data?.message || `Upload failed (HTTP ${res.status})`);
        }

        const url = String(data.path);
        state.streamUrl = url;
        state.needsFile = false;
        btnPlay.disabled = false;
        btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
        btnDownload.disabled = false;
        btnDownload.innerHTML = '<i class="fas fa-download"></i><span>Download</span>';

        // Update meta from filename if we don't have a track.
        const name = String(file.name || 'Uploaded audio').replace(/\.[A-Za-z0-9]+$/, '').trim();
        if (!state.track) state.track = { title: name, artist: '', album: '', thumbnail: '', url: '' };
        if (state.track) {
          state.track.title = state.track.title || name;
          setUiForTrack({ ...state.track, title: state.track.title || name });
        }

        // Cache uploaded URL for this track.
        const k = cacheKeyForTrack(state.track);
        if (k) {
          state.uploadCache[k] = { path: url, at: Date.now() };
          saveCache(state.uploadCache);
        }

        showActivity('Upload ready', 'success');
        await playUrl(url);
      } catch (e) {
        showActivity('Upload failed', 'error');
        hint.textContent = 'Upload gagal. Coba file lain atau ulangi.';
      } finally {
        if (state.needsFile && !state.streamUrl) {
          btnPlay.disabled = false;
          btnPlay.innerHTML = '<i class="fas fa-cloud-arrow-up"></i><span>Choose MP3</span>';
        }
      }
    }

    uploadInput.addEventListener('change', () => {
      const f = uploadInput.files && uploadInput.files[0];
      if (f) uploadAndPlay(f);
    });

    audio.addEventListener('play', () => {
      if (spotifyFab) {
        spotifyFab.dataset.active = '1';
        spotifyFab.dataset.playing = '1';
      }
      setFabCover(state.track?.thumbnail || '');
    });

    audio.addEventListener('pause', () => {
      if (spotifyFab) {
        spotifyFab.dataset.active = '0';
        spotifyFab.dataset.playing = '0';
      }
      setFabCover('');
    });

    audio.addEventListener('ended', () => {
      btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
      showActivity('Ended', 'success');
      if (spotifyFab) {
        spotifyFab.dataset.active = '0';
        spotifyFab.dataset.playing = '0';
      }
      setFabCover('');
      if (Array.isArray(state.queue) && state.queue.length && state.index >= 0 && state.index < state.queue.length - 1) {
        openFromQueue(state.index + 1);
      }
    });

    // Expose for FAB
    window.__spotifyPlayerToggle = () => toggle();

    return {
      open,
      close,
      toggle,
      setQueue(queue, index) {
        state.queue = Array.isArray(queue) ? queue : [];
        state.index = Number.isFinite(Number(index)) ? Number(index) : -1;
        applyQueueUi();
      },
      setTrack(track) {
        state.track = track;
        if (!audio.paused) setFabCover(track?.thumbnail || '');
      },
      getState() {
        return { ...state };
      }
    };
  })();

  function spotifyView() {
    const input = el('input', {
      class: 'input',
      placeholder: 'Cari lagu di Spotify (judul / artist / album)',
      value: ''
    });

    const noticeErr = el('div', { class: 'notice error' });
    const noticeOk = el('div', { class: 'notice success' });

    const resultsWrap = el('div', { class: 'spotify-results' });
    const empty = () =>
      el('div', {
        class: 's-empty',
        html:
          '<div class="title" style="margin:0 0 6px"><i class="fab fa-spotify"></i> Spotify Search</div>' +
          '<div class="subtitle" style="margin:0">Ketik kata kunci, lalu tekan Search. Hasil akan tampil dalam card yang rapi dan responsif.</div>'
      });

    const state = {
      loading: false,
      error: '',
      results: [],
      currentQuery: ''
    };

    // Now Playing is handled globally via spotifyPlayer.

    function clearNotices() {
      noticeErr.style.display = 'none';
      noticeOk.style.display = 'none';
    }

    function setError(msg) {
      state.error = msg || '';
      if (state.error) {
        noticeErr.textContent = 'Error: ' + state.error;
        noticeErr.style.display = 'block';
      } else {
        noticeErr.style.display = 'none';
      }
    }

    function setInfo(msg) {
      if (msg) {
        noticeOk.textContent = String(msg);
        noticeOk.style.display = 'block';
      } else {
        noticeOk.style.display = 'none';
      }
    }

    function renderSkeleton() {
      resultsWrap.innerHTML = '';
      for (let i = 0; i < 6; i++) {
        const card = el('div', { class: 's-card s-skel' }, [
          el('div', { class: 's-row' }, [
            el('div', { class: 's-thumb' }, [el('div', { class: 'block', style: 'width:100%;height:100%;border-radius:16px' })]),
            el('div', { class: 's-meta' }, [
              el('div', { class: 'block', style: 'height:14px;width:92%;margin-bottom:10px' }),
              el('div', { class: 'block', style: 'height:10px;width:68%;margin-bottom:8px;opacity:.8' }),
              el('div', { class: 'block', style: 'height:10px;width:54%;opacity:.7' })
            ])
          ]),
          el('div', { class: 's-actions' }, [
            el('div', { class: 'block', style: 'height:36px;width:122px' }),
            el('div', { class: 'block', style: 'height:36px;width:98px;opacity:.85' })
          ])
        ]);
        resultsWrap.append(card);
      }
    }

    function cardFor(item, idx) {
      const thumbUrl = item.thumbnail || '';
      const title = item.title || 'Untitled';
      const artist = item.artist || '';
      const album = item.album || '';
      const openUrl = item.url || item.open_url || '';
      const previewUrl = item.preview || item.preview_url || '';

      const btnPlayCard = el(
        'button',
        {
          class: 's-btn play',
          type: 'button',
          onclick: () => {
            const normalized = {
              title,
              artist,
              album,
              thumbnail: thumbUrl,
              preview: previewUrl,
              url: openUrl
            };

            const queue = state.results.map((it) => ({
              title: it.title,
              artist: it.artist,
              album: it.album,
              thumbnail: it.thumbnail || '',
              preview: it.preview || it.preview_url || '',
              url: it.url || it.open_url || ''
            }));

            spotifyPlayer.open(normalized, { queue, index: idx });
          }
        },
        [el('i', { class: 'fas fa-play' }), el('span', { html: 'Play' })]
      );

      const btnMore = el(
        'button',
        {
          class: 's-btn more',
          type: 'button',
          onclick: () => {
            const queue = state.results.map((it) => ({
              title: it.title,
              artist: it.artist,
              album: it.album,
              thumbnail: it.thumbnail || '',
              preview: it.preview || it.preview_url || '',
              url: it.url || it.open_url || ''
            }));

            spotifyPlayer.open(
              {
                title,
                artist,
                album,
                thumbnail: thumbUrl,
                preview: previewUrl,
                url: openUrl
              },
              { queue, index: idx }
            );
          }
        },
        [el('i', { class: 'fas fa-chevron-up' }), el('span', { html: 'Player' })]
      );

      const img = thumbUrl
        ? el('img', { src: thumbUrl, alt: title, loading: 'lazy' })
        : el('div', { class: 'subtitle', html: '<i class="fas fa-music"></i>' });

      const card = el('div', { class: 's-card enter', style: `animation-delay:${Math.min(idx, 10) * 35}ms` }, [
        el('div', { class: 's-row' }, [
          el('div', { class: 's-thumb' }, [img]),
          el('div', { class: 's-meta' }, [
            el('p', { class: 's-title', title: title, html: escapeHtml(title) }),
            el('div', { class: 's-sub', html: `${escapeHtml(artist)}${album ? ' • ' + escapeHtml(album) : ''}` })
          ])
        ]),
        el('div', { class: 's-actions' }, [btnPlayCard, btnMore])
      ]);

      return card;
    }

    function render() {
      if (state.loading) {
        renderSkeleton();
        return;
      }
      resultsWrap.innerHTML = '';
      if (state.error) {
        resultsWrap.append(
          el('div', {
            class: 's-empty',
            html:
              '<div class="title" style="margin:0 0 6px"><i class="fas fa-triangle-exclamation"></i> Gagal</div>' +
              '<div class="subtitle" style="margin:0">' +
              escapeHtml(state.error) +
              '</div>'
          })
        );
        return;
      }
      if (!state.results.length) {
        resultsWrap.append(empty());
        return;
      }
      state.results.forEach((it, idx) => resultsWrap.append(cardFor(it, idx)));
    }

    async function doSearch() {
      const q = input.value.trim();
      setError('');
      setInfo('');
      if (!q) {
        state.results = [];
        state.currentQuery = '';
        render();
        return;
      }

      state.loading = true;
      state.currentQuery = q;
      render();
      showActivity('Searching Spotify...', 'info', { sticky: true });

      try {
        const data = await apiGet('/spotify/search', { q, limit: 18 });
        state.results = Array.isArray(data?.results) ? data.results : [];
        state.loading = false;
        setInfo(state.results.length ? `OK: ${state.results.length} hasil.` : 'OK: tidak ada hasil.');
        showActivity(state.results.length ? `Spotify: ${state.results.length} results` : 'Spotify: empty', 'success');
        render();
      } catch (e) {
        state.loading = false;
        const code = String(e.code || '').trim();
        const msg = e.message || 'Gagal mencari.';
        if (code === 'UPSTREAM_FORBIDDEN') {
          setError(
            'Provider download sedang bermasalah (403 / rate limit). Coba lagi beberapa saat.'
          );
        } else {
          setError(msg);
        }
        showActivity('Spotify search failed', 'error');
        render();
      }
    }

    const btn = el(
      'button',
      {
        class: 'primary-btn',
        type: 'button',
        onclick: doSearch
      },
      [el('i', { class: 'fas fa-magnifying-glass' }), el('span', { html: 'Search' })]
    );

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });

    render();

    return el('div', { class: 'spotify-page' }, [
      el('div', { class: 'panel' }, [
        el('h2', { class: 'title' }, [
          el('span', { class: 's-brand' }, [
            el('img', { class: 's-logo', src: '/assets/img/spotify.svg', alt: 'Spotify' }),
            el('span', { html: 'Spotify' })
          ])
        ]),
        el('p', { class: 'subtitle', html: 'Tap Play untuk buka player ala iPhone. Download ada di dalam player.' }),
        el('div', { class: 'spotify-toolbar' }, [
          el('div', { class: 'row' }, [input, btn]),
          noticeErr,
          noticeOk
        ])
      ]),
      resultsWrap
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

      if (loading) {
        showActivity(`Processing ${cfg.label}...`, 'info', { sticky: true });
      }
    }

    function showError(msg) {
      noticeErr.textContent = 'Error: ' + msg;
      noticeErr.style.display = 'block';
      noticeOk.style.display = 'none';
      showActivity(`${cfg.label}: ${msg}`, 'error');
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
        if (result.images.length) {
          const gallery = el('div', { class: 'preview gallery' }, [
            el(
              'div',
              { class: 'gallery-track' },
              result.images.slice(0, 8).map((u, idx) =>
                el('div', { class: 'gallery-card' }, [
                  el('img', { src: u, alt: `image ${idx + 1}` })
                ])
              )
            )
          ]);
          resultWrap.append(gallery);
        }
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

      // Generic image preview (Instagram photos, etc)
      if (!result.video && (result.image || (Array.isArray(result.images) && result.images.length))) {
        const imgs = Array.isArray(result.images) ? result.images : [];
        if (imgs.length > 1) {
          const gallery = el('div', { class: 'preview gallery' }, [
            el(
              'div',
              { class: 'gallery-track' },
              imgs.slice(0, 8).map((u, idx) =>
                el('div', { class: 'gallery-card' }, [
                  el('img', { src: u, alt: `image ${idx + 1}` })
                ])
              )
            )
          ]);
          resultWrap.append(gallery);
        } else {
          const imgUrl = result.image || imgs[0];
          if (imgUrl) {
            const prevImg = el('div', { class: 'preview' }, [el('img', { src: imgUrl, alt: 'preview' })]);
            resultWrap.append(prevImg);
          }
        }
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
        showActivity(`${cfg.label}: done`, 'success');
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

    return el('div', { class: 'panel' }, [
      el('h2', { class: 'title', html: `${cfg.label} Downloader` }),
      el('div', { class: 'form' }, formChildren)
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
      path: '/more',
      title: 'More',
      subtitle: 'More',
      render: () => moreView()
    },
    {
      path: '/qr-generator',
      title: 'QR Generator',
      subtitle: 'Tools',
      render: () => qrView()
    },
    {
      path: '/spotify',
      title: 'Spotify',
      subtitle: 'Search & Download',
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
    setView(match.title, match.render());
  }

  renderRoute();
})();
