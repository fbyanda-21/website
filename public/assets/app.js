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

  async function checkApi() {
    apiStatusEl.textContent = 'checking...';
    try {
      const res = await fetch('/api/v1/health', { cache: 'no-store' });
      apiStatusEl.textContent = res.ok ? 'online' : 'down';
      apiStatusEl.style.color = res.ok ? 'var(--good)' : 'var(--bad)';
    } catch (e) {
      apiStatusEl.textContent = 'down';
      apiStatusEl.style.color = 'var(--bad)';
    }
  }

  checkApi();

  // Music persistence
  const audio = qs('#bg-music');
  const musicToggle = qs('#musicToggle');
  const musicVolume = qs('#musicVolume');
  const musicHint = qs('#musicHint');

  const musicState = {
    enabled: localStorage.getItem('bgMusic.enabled') !== '0',
    volume: Number(localStorage.getItem('bgMusic.volume') || '0.6'),
    time: Number(localStorage.getItem('bgMusic.time') || '0')
  };

  audio.volume = Number.isFinite(musicState.volume) ? musicState.volume : 0.6;
  musicVolume.value = String(audio.volume);

  function setMusicUi(playing) {
    musicToggle.innerHTML = playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    musicHint.textContent = playing ? 'Sedang diputar' : 'Tap untuk mulai';
  }

  async function tryPlayMusic() {
    if (!musicState.enabled) {
      setMusicUi(false);
      return;
    }
    try {
      if (musicState.time > 0 && Number.isFinite(musicState.time)) {
        audio.currentTime = musicState.time;
      }
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
      await audio.play();
      setMusicUi(true);
    } catch (e) {
      setMusicUi(false);
      musicHint.textContent = 'Autoplay diblokir (tap di halaman)';
    }
  });

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
    const url = new URL(path, window.location.origin);
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString(), { cache: 'no-store' });
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
})();
