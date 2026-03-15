(() => {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

  const viewEl = qs('#view');
  const routeTitleEl = qs('#routeTitle');
  const apiStatusEl = qs('#apiStatus');
  const timeEl = qs('#currentTime');

  const activityPill = qs('#activityPill');
  const activityText = qs('#activityText');
  const activityHandle = qs('#activityHandle');

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
      if (['/more', '/facebook', '/qr-generator', '/music'].includes(path)) return '/more';
      return '/dashboard';
    };

    const activeGroup = group(p);
    qsa('.nav-btn').forEach((a) => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === activeGroup);
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

  const activityState = {
    hideTimer: null,
    expanded: false,
    lastText: '',
    lastKind: 'info',
    seq: 0
  };

  function showActivity(text, kind, { sticky } = {}) {
    if (!activityPill || !activityText) return;

    activityState.seq += 1;
    const seq = activityState.seq;

    activityState.lastText = String(text || '').trim() || 'Working...';
    activityState.lastKind = kind || activityState.lastKind || 'info';
    activityText.textContent = activityState.lastText;
    activityPill.dataset.kind = activityState.lastKind;
    activityPill.dataset.active = activityState.lastKind === 'info' ? '1' : '0';
    if (activityHandle) {
      activityHandle.dataset.active = activityPill.dataset.active;
      activityHandle.hidden = true;
    }
    activityPill.hidden = false;
    activityPill.classList.remove('shrink');

    if (activityState.hideTimer) window.clearTimeout(activityState.hideTimer);
    if (!sticky) {
      activityState.hideTimer = window.setTimeout(() => {
        if (activityState.seq !== seq) return;
        if (activityState.expanded) return;
        activityPill.classList.add('shrink');
        window.setTimeout(() => {
          if (activityState.seq !== seq) return;
          if (!activityState.expanded) {
            activityPill.hidden = true;
            if (activityHandle) {
              activityHandle.hidden = false;
              activityHandle.classList.remove('showing');
              // Force reflow for animation.
              void activityHandle.offsetWidth;
              activityHandle.classList.add('showing');
            }
          }
        }, 200);
      }, 5000);
    }
  }

  if (activityPill) {
    activityPill.addEventListener('click', () => {
      activityState.expanded = !activityState.expanded;
      if (activityState.expanded) {
        showActivity(activityState.lastText || 'Ready', activityPill.dataset.kind || 'info', { sticky: true });
      } else {
        showActivity(activityState.lastText || 'Ready', activityPill.dataset.kind || 'info', { sticky: false });
      }
    });
  }

  if (activityHandle) {
    activityHandle.addEventListener('click', () => {
      activityState.expanded = true;
      showActivity(activityState.lastText || 'Ready', activityState.lastKind || 'info', { sticky: true });
    });
  }

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

    const playerAudio = new Audio();
    playerAudio.preload = 'none';

    const player = {
      open: false,
      loading: false,
      track: null,
      streamUrl: '',
      startedAt: 0,
      raf: 0
    };

    const overlay = el('div', { class: 'np-overlay', onclick: () => closePlayer() });
    const sheet = el('div', { class: 'np-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Now Playing' });

    const npTitle = el('div', { class: 's-brand' }, [
      el('img', { class: 's-logo', src: '/assets/img/spotify.svg', alt: 'Spotify' }),
      el('div', { class: 'tiny muted', html: 'Now Playing' })
    ]);

    const btnClose = el('button', { class: 'np-close', type: 'button', onclick: () => closePlayer(), 'aria-label': 'Close' }, [
      el('i', { class: 'fas fa-xmark' })
    ]);

    const artImg = el('img', { alt: 'Cover' });
    const art = el('div', { class: 'np-art' }, [artImg]);
    const titleEl = el('div', { class: 'np-meta' }, [
      el('p', { class: 'np-title', html: 'Track' }),
      el('div', { class: 'np-sub', html: 'Ready' })
    ]);

    const barFill = el('div');
    const bar = el('div', { class: 'np-bar' }, [barFill]);
    const timeL = el('span', { html: '0:00' });
    const timeR = el('span', { html: '0:00' });
    const timeRow = el('div', { class: 'np-time' }, [timeL, timeR]);

    const btnPlay = el('button', { class: 'np-play', type: 'button', disabled: true });
    btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
    btnPlay.addEventListener('click', () => togglePlayer());

    const btnDownload = el('button', { class: 's-btn primary', type: 'button' }, [
      el('i', { class: 'fas fa-download' }),
      el('span', { html: 'Download' })
    ]);

    const btnOpen = el('a', { class: 's-btn ghost', href: '#', target: '_blank', rel: 'noreferrer' }, [
      el('i', { class: 'fas fa-arrow-up-right-from-square' }),
      el('span', { html: 'Open' })
    ]);

    const hint = el('p', { class: 's-hint', html: 'Tap Play untuk mulai. Jika hanya tersedia preview, durasi biasanya 30 detik.' });

    sheet.append(
      el('div', { class: 'np-top' }, [npTitle, btnClose]),
      el('div', { class: 'np-grab', 'aria-hidden': 'true' }),
      el('div', { class: 'np-body' }, [
        art,
        el('div', {}, [
          titleEl,
          el('div', { class: 'np-progress' }, [bar, timeRow]),
          el('div', { class: 'np-controls' }, [btnPlay, hint]),
          el('div', { class: 'np-actions' }, [btnDownload, btnOpen])
        ])
      ])
    );

    function fmtTime(sec) {
      const n = Math.max(0, Math.floor(Number(sec) || 0));
      const m = Math.floor(n / 60);
      const s = n % 60;
      return `${m}:${String(s).padStart(2, '0')}`;
    }

    function updateProgress() {
      if (!player.open) return;
      const cur = Number(playerAudio.currentTime || 0);
      const dur = Number(playerAudio.duration || 0);
      timeL.textContent = fmtTime(cur);
      timeR.textContent = Number.isFinite(dur) && dur > 0 ? fmtTime(dur) : '0:00';
      const pct = dur > 0 ? Math.min(100, Math.max(0, (cur / dur) * 100)) : 0;
      barFill.style.width = pct.toFixed(2) + '%';
      player.raf = window.requestAnimationFrame(updateProgress);
    }

    function openPlayer(track) {
      player.track = track;
      player.open = true;
      overlay.classList.add('open');
      sheet.classList.add('open');
      overlay.style.display = 'block';

      const t = track || {};
      const tTitle = String(t.title || 'Track');
      const tArtist = String(t.artist || '');
      const tAlbum = String(t.album || '');
      const subtitle = [tArtist, tAlbum].filter(Boolean).join(' • ') || ' '; 
      titleEl.querySelector('.np-title').textContent = tTitle;
      titleEl.querySelector('.np-sub').textContent = subtitle;
      artImg.src = t.thumbnail || '/assets/img/logo.jpg';
      btnOpen.href = t.url || '#';
      btnOpen.style.pointerEvents = t.url ? 'auto' : 'none';
      btnOpen.style.opacity = t.url ? '1' : '0.6';

      btnPlay.disabled = true;
      btnDownload.disabled = true;
      btnDownload.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Preparing...</span>';
      btnPlay.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Loading...</span>';

      resolveStream(t).catch(() => {});

      if (player.raf) window.cancelAnimationFrame(player.raf);
      player.raf = window.requestAnimationFrame(updateProgress);
    }

    function closePlayer() {
      player.open = false;
      overlay.classList.remove('open');
      sheet.classList.remove('open');
      window.setTimeout(() => {
        if (!player.open) overlay.style.display = 'none';
      }, 220);
      if (player.raf) window.cancelAnimationFrame(player.raf);
      player.raf = 0;
    }

    async function resolveStream(t) {
      player.loading = true;
      showActivity('Preparing playback...', 'info', { sticky: true });

      const preferred = String(t.preview || '').trim();
      if (preferred) {
        player.streamUrl = preferred;
        btnDownload.disabled = false;
        btnDownload.innerHTML = '<i class="fas fa-download"></i><span>Download</span>';
        btnPlay.disabled = false;
        btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
        player.loading = false;
        showActivity('Ready', 'success');
        await playUrl(preferred);
        return;
      }

      // Fallback: ask API to resolve a stream/download URL
      try {
        const info = await apiGet('/spotify/download', { url: t.url || '' });
        const u = String(info.download || '').trim();
        if (!u) throw new Error('Download link not available');
        player.streamUrl = u;

        btnDownload.disabled = false;
        btnDownload.innerHTML = '<i class="fas fa-download"></i><span>Download</span>';
        btnPlay.disabled = false;
        btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
        player.loading = false;
        showActivity('Ready', 'success');

        // Update meta if provided.
        if (info.title) titleEl.querySelector('.np-title').textContent = info.title;
        const sub = [info.artist, info.album].filter(Boolean).join(' • ');
        if (sub) titleEl.querySelector('.np-sub').textContent = sub;
        if (info.thumbnail) artImg.src = info.thumbnail;

        // Wire download button.
        btnDownload.onclick = async () => {
          showActivity('Downloading...', 'info', { sticky: true });
          const name = filenameSafe(`${info.title || t.title} - ${info.artist || t.artist}`) || 'spotify-download';
          const ext = String(info.extension || 'mp3').replace(/\W+/g, '') || 'mp3';
          await downloadFile(u, `${name}.${ext}`);
          showActivity('Download ready', 'success');
        };

        await playUrl(u);
      } catch (e) {
        player.loading = false;
        btnPlay.disabled = true;
        btnPlay.innerHTML = '<i class="fas fa-triangle-exclamation"></i><span>Unavailable</span>';
        btnDownload.disabled = true;
        btnDownload.innerHTML = '<i class="fas fa-triangle-exclamation"></i><span>Failed</span>';
        hint.textContent = 'Download gagal. Provider kadang block / rate limit. Coba lagi beberapa saat.';
        showActivity('Playback failed', 'error');
      }
    }

    async function playUrl(u) {
      if (!u) return;
      if (playerAudio.src !== u) playerAudio.src = u;
      try {
        await playerAudio.play();
        btnPlay.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
        showActivity('Now Playing', 'info', { sticky: true });
      } catch (e) {
        btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
        showActivity('Tap to play', 'success');
      }
    }

    function togglePlayer() {
      if (!player.streamUrl) return;
      if (playerAudio.paused) {
        playUrl(player.streamUrl);
      } else {
        playerAudio.pause();
        btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
        showActivity('Paused', 'success');
      }
    }

    playerAudio.addEventListener('ended', () => {
      btnPlay.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
      showActivity('Ended', 'success');
    });

    // Default download handler (updated when resolveStream returns info)
    btnDownload.onclick = async () => {
      if (!player.streamUrl) return;
      showActivity('Downloading...', 'info', { sticky: true });
      const t = player.track || {};
      const name = filenameSafe(`${t.title || 'spotify'} - ${t.artist || ''}`) || 'spotify-download';
      await downloadFile(player.streamUrl, `${name}.mp3`);
      showActivity('Download ready', 'success');
    };

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

    function filenameSafe(s) {
      return String(s || '')
        .trim()
        .replace(/[\\/:*?"<>|]+/g, '-')
        .replace(/\s+/g, ' ')
        .slice(0, 120);
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
            openPlayer({
              title,
              artist,
              album,
              thumbnail: thumbUrl,
              preview: previewUrl,
              url: openUrl
            });
          }
        },
        [el('i', { class: 'fas fa-play' }), el('span', { html: 'Play' })]
      );

      const btnMore = el(
        'button',
        {
          class: 's-btn more',
          type: 'button',
          onclick: () => openPlayer({
            title,
            artist,
            album,
            thumbnail: thumbUrl,
            preview: previewUrl,
            url: openUrl
          })
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
      resultsWrap,
      overlay,
      sheet
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
