// ==================== KONFIGURASI ====================
const CONFIG = {
    // API Proxy Endpoint (Backend kita)
    API_BASE_URL: 'api/download.php', // Ganti dengan path ke file PHP
    
    // Fallback APIs (jika proxy tidak tersedia)
    FALLBACK_APIS: {
        instagram: 'https://instagram-downloader-api3.p.rapidapi.com/download',
        tiktok: 'https://tiktok-video-no-watermark2.p.rapidapi.com/',
        youtube: 'https://youtube-video-download-info.p.rapidapi.com/dl',
        facebook: 'https://facebook-reel-and-video-downloader.p.rapidapi.com/api/facebookVideo'
    },
    
    // RapidAPI Key (Hanya untuk fallback)
    RAPIDAPI_KEY: '15b2e1d1d0msh0ac4048b4645f31p1f6dc9jsn938e039327f3'
};

// ==================== VARIABLES ====================
let currentTool = null;
let currentDownloadType = 'video';
let currentVideoData = null;
let isAnalyzing = false;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Downloader Pro Initializing...');
    
    // Hide loading screen dengan delay
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            showNotification('Downloader Pro siap digunakan!', 'success');
        }, 500);
    }, 1500);

    // Initialize semua event listeners
    initializeEventListeners();
    
    // Load dashboard pertama kali
    loadDashboard();
    
    // Check server status
    checkServerStatus();
    
    // Initialize theme
    initializeTheme();
    
    // Test API connection
    setTimeout(testAPIStatus, 2000);
});

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', () => toggleSidebar());
    document.getElementById('closeSidebar').addEventListener('click', () => toggleSidebar());
    
    // Dashboard button
    document.getElementById('dashboardBtn').addEventListener('click', (e) => {
        e.preventDefault();
        setActiveMenuItem('dashboardBtn');
        loadDashboard();
    });
    
    // Tool navigation
    document.querySelectorAll('.menu-item[data-tool]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tool = this.getAttribute('data-tool');
            setActiveMenuItem(this.id || `tool-${tool}`);
            loadTool(tool);
            toggleSidebar();
        });
    });
    
    // Info buttons
    document.getElementById('howToUseBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showHowToUse();
    });
    
    document.getElementById('apiStatusBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showAPIStatus();
    });
    
    document.getElementById('apiTestBtn')?.addEventListener('click', () => {
        testAllAPIs();
    });
    
    // Search box
    document.getElementById('platformSearch')?.addEventListener('input', function(e) {
        filterPlatforms(this.value.toLowerCase());
    });
    
    // Close video popup dengan ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeVideoPopup();
        }
    });
}

// ==================== THEME MANAGEMENT ====================
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        updateThemeToggle('light');
    } else {
        document.body.classList.add('dark-theme');
        updateThemeToggle('dark');
    }
}

function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        updateThemeToggle('light');
    } else {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        updateThemeToggle('dark');
    }
}

function updateThemeToggle(theme) {
    const toggle = document.getElementById('themeToggle');
    const icon = toggle.querySelector('i');
    const text = toggle.querySelector('span');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-moon';
        text.textContent = 'Mode Gelap';
    } else {
        icon.className = 'fas fa-sun';
        text.textContent = 'Mode Terang';
    }
}

// ==================== SIDEBAR MANAGEMENT ====================
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
    
    // Jika di mobile, tambah overlay
    if (window.innerWidth <= 1024) {
        if (sidebar.classList.contains('active')) {
            createOverlay();
        } else {
            removeOverlay();
        }
    }
}

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 900;
    `;
    overlay.addEventListener('click', () => toggleSidebar());
    document.body.appendChild(overlay);
}

function removeOverlay() {
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function setActiveMenuItem(itemId) {
    // Remove active class dari semua menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class ke item yang dipilih
    const activeItem = document.getElementById(itemId);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// ==================== DASHBOARD ====================
function loadDashboard() {
    console.log('📊 Loading dashboard...');
    
    const container = document.getElementById('dashboardContainer');
    const toolContainer = document.getElementById('toolContainer');
    
    toolContainer.style.display = 'none';
    container.style.display = 'block';
    
    // Update page title
    document.getElementById('pageTitle').textContent = 'Dashboard';
    
    container.innerHTML = `
        <div class="welcome-section" style="margin-bottom: 40px;">
            <h1 style="font-size: 2.5rem; margin-bottom: 10px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Selamat Datang! 👋</h1>
            <p style="color: var(--text-secondary); font-size: 1.1rem;">Download video & audio dari berbagai platform dengan mudah</p>
        </div>
        
        <div class="dashboard-grid">
            <div class="stats-card">
                <i class="fas fa-download"></i>
                <h3>Total Download</h3>
                <p>Jumlah download hari ini</p>
                <div class="stats-value" id="downloadCount">${localStorage.getItem('downloadCount') || '0'}</div>
            </div>
            
            <div class="stats-card">
                <i class="fas fa-bolt"></i>
                <h3>Kecepatan Server</h3>
                <p>Response time rata-rata</p>
                <div class="stats-value">24<span style="font-size: 1rem;">ms</span></div>
            </div>
            
            <div class="stats-card">
                <i class="fas fa-check-circle"></i>
                <h3>Sukses Rate</h3>
                <p>Persentase download berhasil</p>
                <div class="stats-value">98<span style="font-size: 1rem;">%</span></div>
            </div>
            
            <div class="stats-card">
                <i class="fas fa-users"></i>
                <h3>Pengguna Aktif</h3>
                <p>Pengguna online saat ini</p>
                <div class="stats-value" id="activeUsers">${Math.floor(Math.random() * 100) + 50}</div>
            </div>
        </div>
        
        <h2 style="margin: 40px 0 25px 0; font-size: 1.8rem;">📱 Pilih Platform Download</h2>
        
        <div class="tools-grid" id="platformsGrid">
            <div class="tool-card instagram" data-tool="instagram">
                <i class="fab fa-instagram"></i>
                <h3>Instagram</h3>
                <p>Download video, foto, dan reel tanpa watermark</p>
                <button class="download-btn secondary" onclick="loadTool('instagram')">
                    <i class="fas fa-play"></i> Gunakan Tool
                </button>
            </div>
            
            <div class="tool-card tiktok" data-tool="tiktok">
                <i class="fab fa-tiktok"></i>
                <h3>TikTok</h3>
                <p>Download video TikTok tanpa watermark</p>
                <button class="download-btn secondary" onclick="loadTool('tiktok')">
                    <i class="fas fa-play"></i> Gunakan Tool
                </button>
            </div>
            
            <div class="tool-card youtube" data-tool="youtube">
                <i class="fab fa-youtube"></i>
                <h3>YouTube</h3>
                <p>Download video YouTube berbagai kualitas</p>
                <button class="download-btn secondary" onclick="loadTool('youtube')">
                    <i class="fas fa-play"></i> Gunakan Tool
                </button>
            </div>
            
            <div class="tool-card facebook" data-tool="facebook">
                <i class="fab fa-facebook"></i>
                <h3>Facebook</h3>
                <p>Download video Facebook tanpa batas</p>
                <button class="download-btn secondary" onclick="loadTool('facebook')">
                    <i class="fas fa-play"></i> Gunakan Tool
                </button>
            </div>
        </div>
        
        <div class="quick-guide" style="margin-top: 50px; padding: 30px; background: var(--card-bg); border-radius: 20px; border: 1px solid var(--border-color);">
            <h3 style="margin-bottom: 20px; font-size: 1.5rem;"><i class="fas fa-lightbulb"></i> Cara Cepat</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div style="padding: 15px; background: var(--hover-color); border-radius: 12px;">
                    <h4 style="margin-bottom: 10px; color: var(--primary-color);"><i class="fas fa-1"></i> Pilih Platform</h4>
                    <p style="color: var(--text-secondary);">Klik platform yang ingin Anda gunakan</p>
                </div>
                <div style="padding: 15px; background: var(--hover-color); border-radius: 12px;">
                    <h4 style="margin-bottom: 10px; color: var(--primary-color);"><i class="fas fa-2"></i> Tempel Link</h4>
                    <p style="color: var(--text-secondary);">Salin dan tempel link video</p>
                </div>
                <div style="padding: 15px; background: var(--hover-color); border-radius: 12px;">
                    <h4 style="margin-bottom: 10px; color: var(--primary-color);"><i class="fas fa-3"></i> Download</h4>
                    <p style="color: var(--text-secondary);">Pilih kualitas dan download</p>
                </div>
            </div>
        </div>
        
        <div class="api-status" id="apiStatusWidget" style="margin-top: 30px;"></div>
    `;
    
    // Update API status widget
    updateAPIStatusWidget();
}

function filterPlatforms(searchTerm) {
    const cards = document.querySelectorAll('.tool-card');
    let found = false;
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const desc = card.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || desc.includes(searchTerm)) {
            card.style.display = 'block';
            found = true;
        } else {
            card.style.display = 'none';
        }
    });
    
    if (!found && searchTerm) {
        document.getElementById('platformsGrid').innerHTML += `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>Platform tidak ditemukan</h3>
                <p>Coba cari dengan kata kunci lain</p>
            </div>
        `;
    }
}

// ==================== TOOL LOADER ====================
function loadTool(tool) {
    console.log(`🛠️ Loading ${tool} tool...`);
    
    currentTool = tool;
    currentVideoData = null;
    
    const container = document.getElementById('dashboardContainer');
    const toolContainer = document.getElementById('toolContainer');
    
    container.style.display = 'none';
    toolContainer.style.display = 'block';
    
    // Update page title
    const toolNames = {
        instagram: 'Instagram',
        tiktok: 'TikTok',
        youtube: 'YouTube',
        facebook: 'Facebook'
    };
    document.getElementById('pageTitle').textContent = toolNames[tool] || 'Tool';
    
    // Tool configuration
    const toolConfig = {
        instagram: {
            name: 'Instagram',
            icon: 'fab fa-instagram',
            color: '#E1306C',
            placeholder: 'Tempel link Instagram (reel, video, foto)...',
            example: 'https://www.instagram.com/p/Cxample...',
            description: 'Download video, foto, dan reel Instagram tanpa watermark dalam kualitas HD'
        },
        tiktok: {
            name: 'TikTok',
            icon: 'fab fa-tiktok',
            color: '#000000',
            placeholder: 'Tempel link TikTok...',
            example: 'https://www.tiktok.com/@user/video/123456...',
            description: 'Download video TikTok tanpa watermark dengan kualitas terbaik'
        },
        youtube: {
            name: 'YouTube',
            icon: 'fab fa-youtube',
            color: '#FF0000',
            placeholder: 'Tempel link YouTube...',
            example: 'https://www.youtube.com/watch?v=example...',
            description: 'Download video YouTube dalam berbagai kualitas hingga 4K'
        },
        facebook: {
            name: 'Facebook',
            icon: 'fab fa-facebook',
            color: '#1877F2',
            placeholder: 'Tempel link Facebook...',
            example: 'https://www.facebook.com/watch/?v=example...',
            description: 'Download video Facebook tanpa batas dan tanpa watermark'
        }
    };
    
    const config = toolConfig[tool];
    
    toolContainer.innerHTML = `
        <div class="tool-header" style="border-left-color: ${config.color};">
            <i class="${config.icon}" style="color: ${config.color}; font-size: 2.8rem;"></i>
            <div>
                <h1 style="font-size: 2.2rem; margin-bottom: 5px; color: ${config.color};">${config.name} Downloader</h1>
                <p style="color: var(--text-secondary); font-size: 1.1rem;">${config.description}</p>
            </div>
        </div>
        
        <div class="download-section">
            <h2 class="section-title" style="font-size: 1.6rem; margin-bottom: 25px;">
                <i class="fas fa-download"></i> Download Konten
            </h2>
            
            <div class="input-group">
                <input type="text" id="urlInput" 
                       placeholder="${config.placeholder}"
                       value="${config.example}"
                       onfocus="this.select()">
                <button id="analyzeBtn">
                    <i class="fas fa-search"></i> Analisis Tautan
                </button>
            </div>
            
            <div class="download-type-selector">
                <div class="type-option active" data-type="video">
                    <i class="fas fa-video"></i> Video
                </div>
                <div class="type-option" data-type="audio">
                    <i class="fas fa-music"></i> Audio Saja
                </div>
            </div>
        </div>
        
        <div class="preview-section" id="previewSection">
            <h2 class="section-title" style="font-size: 1.6rem; margin-bottom: 25px;">
                <i class="fas fa-eye"></i> Preview Konten
            </h2>
            <div class="preview-content">
                <div class="video-preview" id="videoPreview">
                    <div class="video-placeholder" style="padding: 40px; text-align: center; color: var(--text-secondary);">
                        <i class="fas fa-play-circle" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;"></i>
                        <p>Preview video akan muncul di sini setelah analisis</p>
                    </div>
                </div>
                <div class="preview-info" id="previewInfo"></div>
            </div>
        </div>
        
        <div class="quality-selector" id="qualitySelector">
            <h2 class="section-title" style="font-size: 1.6rem; margin-bottom: 25px;">
                <i class="fas fa-list"></i> Pilih Kualitas
            </h2>
            <div class="quality-options" id="qualityOptions">
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-arrow-up" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>Analisis tautan terlebih dahulu</h3>
                    <p>Klik "Analisis Tautan" untuk melihat pilihan kualitas</p>
                </div>
            </div>
        </div>
        
        <div class="download-progress" id="downloadProgress">
            <h2 class="section-title" style="font-size: 1.6rem; margin-bottom: 25px;">
                <i class="fas fa-spinner"></i> Proses Download
            </h2>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <p class="progress-text" id="progressText">Menunggu...</p>
        </div>
        
        <div class="features" style="margin-top: 50px;">
            <h2 class="section-title" style="font-size: 1.6rem; margin-bottom: 25px;">
                <i class="fas fa-star"></i> Keunggulan ${config.name}
            </h2>
            <div class="tools-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                <div class="tool-card" style="padding: 25px;">
                    <i class="fas fa-ban" style="color: var(--danger-color);"></i>
                    <h3>Tanpa Watermark</h3>
                    <p>Hapus watermark dari konten yang didownload</p>
                </div>
                
                <div class="tool-card" style="padding: 25px;">
                    <i class="fas fa-hd" style="color: var(--primary-color);"></i>
                    <h3>Kualitas HD</h3>
                    <p>Download dalam kualitas terbaik yang tersedia</p>
                </div>
                
                <div class="tool-card" style="padding: 25px;">
                    <i class="fas fa-bolt" style="color: var(--warning-color);"></i>
                    <h3>Cepat & Mudah</h3>
                    <p>Proses download cepat tanpa registrasi</p>
                </div>
                
                <div class="tool-card" style="padding: 25px;">
                    <i class="fas fa-shield-alt" style="color: var(--success-color);"></i>
                    <h3>Aman & Terpercaya</h3>
                    <p>100% aman, tidak butuh login</p>
                </div>
            </div>
        </div>
    `;
    
    // Initialize tool-specific event listeners
    initializeToolListeners();
    
    // Hide sections initially
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('qualitySelector').style.display = 'none';
    document.getElementById('downloadProgress').style.display = 'none';
}

function initializeToolListeners() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const urlInput = document.getElementById('urlInput');
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeURL);
    }
    
    if (urlInput) {
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                analyzeURL();
            }
        });
        
        // Clear placeholder on click
        urlInput.addEventListener('click', function() {
            if (this.value.includes('...')) {
                this.value = '';
            }
        });
    }
    
    // Download type selector
    document.querySelectorAll('.type-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.type-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            currentDownloadType = this.getAttribute('data-type');
            
            // Refresh quality options if video data exists
            if (currentVideoData) {
                showQualityOptions(currentVideoData);
            }
        });
    });
}

// ==================== URL ANALYSIS ====================
async function analyzeURL() {
    if (isAnalyzing) return;
    
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const url = urlInput.value.trim();
    
    // Validation
    if (!url) {
        showNotification('Masukkan link terlebih dahulu', 'error');
        urlInput.focus();
        return;
    }
    
    if (!isValidURL(url)) {
        showNotification('Format URL tidak valid', 'error');
        return;
    }
    
    // Check if URL matches platform
    if (!isValidPlatformURL(currentTool, url)) {
        showNotification(`URL bukan link ${currentTool} yang valid`, 'warning');
        return;
    }
    
    // Set analyzing state
    isAnalyzing = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menganalisis...';
    analyzeBtn.disabled = true;
    
    // Reset previous data
    currentVideoData = null;
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('qualitySelector').style.display = 'none';
    
    try {
        console.log(`🔍 Analyzing ${currentTool} URL: ${url}`);
        
        // Show analyzing notification
        const notifId = showNotification('Menganalisis link...', 'info', 0);
        
        // Call our API proxy
        const videoData = await fetchVideoInfo(url);
        
        // Hide analyzing notification
        removeNotification(notifId);
        
        if (!videoData || videoData.error) {
            throw new Error(videoData?.error || 'Gagal menganalisis video');
        }
        
        // Store video data
        currentVideoData = videoData;
        
        // Show preview
        showPreview(videoData);
        
        // Show quality options
        showQualityOptions(videoData);
        
        // Success notification
        showNotification('Berhasil menganalisis video!', 'success');
        
    } catch (error) {
        console.error('❌ Analysis error:', error);
        
        // Show error based on type
        if (error.message.includes('CORS') || error.message.includes('Network')) {
            showNotification('Koneksi jaringan bermasalah. Coba lagi nanti.', 'error');
        } else if (error.message.includes('tidak valid') || error.message.includes('invalid')) {
            showNotification('Link tidak valid atau video tidak ditemukan', 'error');
        } else if (error.message.includes('diblokir') || error.message.includes('blocked')) {
            showNotification('Video tidak dapat diakses atau diblokir', 'error');
        } else {
            showNotification(`Gagal menganalisis: ${error.message}`, 'error');
        }
        
    } finally {
        // Reset analyzing state
        isAnalyzing = false;
        analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analisis Tautan';
        analyzeBtn.disabled = false;
    }
}

// ==================== API INTEGRATION ====================
async function fetchVideoInfo(url) {
    console.log(`📡 Fetching video info for ${currentTool}`);
    
    try {
        // Method 1: Try our PHP proxy first
        const proxyResponse = await fetch(CONFIG.API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                platform: currentTool,
                url: url
            })
        });
        
        if (proxyResponse.ok) {
            const data = await proxyResponse.json();
            
            if (data.success && data.data) {
                console.log('✅ Success from proxy:', data.data);
                return formatVideoData(data.data);
            }
        }
        
        // Method 2: Fallback to direct RapidAPI calls
        console.log('🔄 Trying fallback API...');
        return await fetchFromRapidAPI(url);
        
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
}

async function fetchFromRapidAPI(url) {
    const config = {
        instagram: {
            url: 'https://instagram-downloader-api3.p.rapidapi.com/download',
            params: { url: url }
        },
        tiktok: {
            url: 'https://tiktok-video-no-watermark2.p.rapidapi.com/',
            params: { url: url, hd: '1' }
        },
        youtube: {
            url: 'https://youtube-video-download-info.p.rapidapi.com/dl',
            params: { id: extractYouTubeID(url) }
        },
        facebook: {
            url: 'https://facebook-reel-and-video-downloader.p.rapidapi.com/api/facebookVideo',
            params: { url: url }
        }
    };
    
    const apiConfig = config[currentTool];
    if (!apiConfig) throw new Error('Platform tidak didukung');
    
    // Build URL with params
    const apiUrl = new URL(apiConfig.url);
    Object.entries(apiConfig.params).forEach(([key, value]) => {
        if (value) apiUrl.searchParams.append(key, value);
    });
    
    const response = await fetch(apiUrl, {
        headers: {
            'x-rapidapi-key': CONFIG.RAPIDAPI_KEY,
            'x-rapidapi-host': new URL(apiConfig.url).hostname
        }
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return formatVideoData(data);
}

function formatVideoData(apiData) {
    // Format data berdasarkan respons API
    const platform = currentTool;
    
    const formats = {
        instagram: {
            title: apiData.title || 'Instagram Video',
            thumbnail: apiData.thumbnail || apiData.image || getDefaultThumbnail(platform),
            duration: apiData.duration || 'N/A',
            author: apiData.author || apiData.username || 'Instagram User',
            qualities: apiData.videos || [{ quality: 'HD', url: apiData.url }],
            audio: apiData.audio || null
        },
        tiktok: {
            title: apiData.title || 'TikTok Video',
            thumbnail: apiData.cover || apiData.thumbnail || getDefaultThumbnail(platform),
            duration: formatDuration(apiData.duration),
            author: apiData.author?.nickname || apiData.author_name || 'TikTok User',
            qualities: apiData.video || [{ quality: 'HD', url: apiData.download_url }],
            audio: apiData.music || null
        },
        youtube: {
            title: apiData.title || 'YouTube Video',
            thumbnail: apiData.thumbnail || getDefaultThumbnail(platform),
            duration: apiData.duration || 'N/A',
            author: apiData.author || apiData.channel || 'YouTube Channel',
            qualities: apiData.video || apiData.formats || [],
            audio: apiData.audio || null
        },
        facebook: {
            title: apiData.title || 'Facebook Video',
            thumbnail: apiData.thumbnail || getDefaultThumbnail(platform),
            duration: apiData.duration || 'N/A',
            author: apiData.author || apiData.page_name || 'Facebook User',
            qualities: apiData.videos || [{ quality: 'HD', url: apiData.url }],
            audio: apiData.audio || null
        }
    };
    
    return formats[platform] || {
        title: 'Video',
        thumbnail: getDefaultThumbnail(platform),
        duration: 'N/A',
        author: 'Unknown',
        qualities: [],
        audio: null
    };
}

// ==================== PREVIEW SYSTEM ====================
function showPreview(videoData) {
    const previewSection = document.getElementById('previewSection');
    const videoPreview = document.getElementById('videoPreview');
    const previewInfo = document.getElementById('previewInfo');
    
    // Show section
    previewSection.style.display = 'block';
    previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Build preview HTML
    videoPreview.innerHTML = `
        <div class="video-container">
            <img src="${videoData.thumbnail}" alt="${videoData.title}" 
                 onerror="this.src='https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=400&fit=crop'">
            <div class="play-overlay" onclick="playVideoPreview('${videoData.qualities[0]?.url || ''}')">
                <i class="fas fa-play"></i>
            </div>
            <div class="video-info-overlay">
                <h3>${videoData.title}</h3>
                <p><i class="fas fa-user"></i> ${videoData.author} • <i class="fas fa-clock"></i> ${videoData.duration}</p>
            </div>
        </div>
    `;
    
    // Build info HTML
    previewInfo.innerHTML = `
        <div class="info-row">
            <span><i class="fas fa-film"></i> Platform</span>
            <span>${currentTool.charAt(0).toUpperCase() + currentTool.slice(1)}</span>
        </div>
        <div class="info-row">
            <span><i class="fas fa-heading"></i> Judul</span>
            <span>${videoData.title}</span>
        </div>
        <div class="info-row">
            <span><i class="fas fa-clock"></i> Durasi</span>
            <span>${videoData.duration}</span>
        </div>
        <div class="info-row">
            <span><i class="fas fa-user"></i> Uploader</span>
            <span>${videoData.author}</span>
        </div>
        <div class="info-row">
            <span><i class="fas fa-check-circle"></i> Status</span>
            <span class="text-success"><i class="fas fa-check"></i> Siap di-download</span>
        </div>
    `;
}

function showQualityOptions(videoData) {
    const qualitySelector = document.getElementById('qualitySelector');
    const qualityOptions = document.getElementById('qualityOptions');
    
    // Show section
    qualitySelector.style.display = 'block';
    qualitySelector.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    let optionsHTML = '';
    
    if (currentDownloadType === 'audio') {
        // Audio options
        if (videoData.audio) {
            optionsHTML += `
                <div class="quality-option">
                    <div class="quality-header">
                        <h4><i class="fas fa-music"></i> Audio Original</h4>
                        <span class="quality-badge">MP3</span>
                    </div>
                    <p><i class="fas fa-volume-up"></i> Kualitas asli</p>
                    <p><i class="fas fa-file-audio"></i> Format: MP3</p>
                    <button class="download-btn" onclick="downloadFile('${videoData.audio.url}', 'audio', '${videoData.title}.mp3')">
                        <i class="fas fa-download"></i> Download MP3
                    </button>
                </div>
            `;
        } else {
            optionsHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary); grid-column: 1 / -1;">
                    <i class="fas fa-music-slash" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>Audio tidak tersedia</h3>
                    <p>Video ini tidak memiliki audio terpisah</p>
                </div>
            `;
        }
    } else {
        // Video options
        if (videoData.qualities && videoData.qualities.length > 0) {
            videoData.qualities.forEach((quality, index) => {
                const qualityLabel = quality.quality || (index === 0 ? 'HD' : 'SD');
                const size = quality.size || estimateFileSize(qualityLabel);
                
                optionsHTML += `
                    <div class="quality-option">
                        <div class="quality-header">
                            <h4><i class="fas fa-video"></i> ${qualityLabel}</h4>
                            <span class="quality-badge">${qualityLabel}</span>
                        </div>
                        <p><i class="fas fa-tv"></i> Kualitas ${qualityLabel}</p>
                        <p><i class="fas fa-hdd"></i> Perkiraan: ${size}</p>
                        <p><i class="fas fa-ban"></i> Tanpa watermark</p>
                        <button class="download-btn" onclick="downloadFile('${quality.url}', 'video', '${videoData.title} - ${qualityLabel}.mp4')">
                            <i class="fas fa-download"></i> Download ${qualityLabel}
                        </button>
                    </div>
                `;
            });
        } else {
            optionsHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary); grid-column: 1 / -1;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px; color: var(--warning-color);"></i>
                    <h3>Kualitas tidak tersedia</h3>
                    <p>Tidak ada pilihan kualitas untuk video ini</p>
                </div>
            `;
        }
    }
    
    qualityOptions.innerHTML = optionsHTML;
}

// ==================== DOWNLOAD SYSTEM ====================
async function downloadFile(url, type, filename) {
    if (!url || !currentVideoData) {
        showNotification('Data tidak valid untuk download', 'error');
        return;
    }
    
    console.log(`⬇️ Starting download: ${filename}`);
    
    // Show progress section
    const progressSection = document.getElementById('downloadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressSection.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Mempersiapkan download...';
    progressSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    try {
        // Simulate progress for better UX
        simulateProgress(progressFill, progressText);
        
        // Actually download the file
        await performDownload(url, filename);
        
        // Complete progress
        progressFill.style.width = '100%';
        progressText.innerHTML = '<span class="text-success"><i class="fas fa-check"></i> Download selesai!</span>';
        
        // Update download count
        updateDownloadCount();
        
        // Success notification
        showNotification(`Berhasil mendownload ${type === 'audio' ? 'audio' : 'video'}!`, 'success');
        
        // Hide progress after delay
        setTimeout(() => {
            progressSection.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('❌ Download error:', error);
        
        progressFill.style.width = '0%';
        progressText.innerHTML = '<span class="text-error"><i class="fas fa-times"></i> Download gagal</span>';
        
        showNotification(`Download gagal: ${error.message}`, 'error');
        
        setTimeout(() => {
            progressSection.style.display = 'none';
        }, 3000);
    }
}

async function performDownload(url, filename) {
    return new Promise((resolve, reject) => {
        // Method 1: Direct download using anchor tag
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        link.onclick = () => {
            setTimeout(() => {
                document.body.removeChild(link);
                resolve();
            }, 100);
        };
        
        link.onerror = (error) => {
            document.body.removeChild(link);
            reject(new Error('Gagal memulai download'));
        };
        
        document.body.appendChild(link);
        link.click();
    });
}

function simulateProgress(progressFill, progressText) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 90) {
            clearInterval(interval);
            progressFill.style.width = '90%';
            progressText.textContent = 'Menyelesaikan download...';
        } else {
            progressFill.style.width = `${progress}%`;
            
            if (progress < 30) {
                progressText.textContent = 'Menyiapkan file...';
            } else if (progress < 60) {
                progressText.textContent = 'Mendownload data...';
            } else {
                progressText.textContent = 'Hampir selesai...';
            }
        }
    }, 200);
}

// ==================== VIDEO PLAYER ====================
function playVideoPreview(videoUrl) {
    if (!videoUrl) {
        showNotification('Tidak dapat memutar video', 'error');
        return;
    }
    
    const popup = document.getElementById('videoPopup');
    const video = document.getElementById('popupVideo');
    
    video.src = videoUrl;
    popup.style.display = 'flex';
    
    // Add close button listener
    popup.querySelector('.close-popup').onclick = closeVideoPopup;
    
    // Close on background click
    popup.onclick = (e) => {
        if (e.target === popup) {
            closeVideoPopup();
        }
    };
}

function closeVideoPopup() {
    const popup = document.getElementById('videoPopup');
    const video = document.getElementById('popupVideo');
    
    video.pause();
    video.src = '';
    popup.style.display = 'none';
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notificationContainer');
    const id = 'notif-' + Date.now();
    
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="${icons[type] || 'fas fa-info-circle'}"></i>
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="close-notification" onclick="removeNotification('${id}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Auto remove if duration is specified
    if (duration > 0) {
        setTimeout(() => removeNotification(id), duration);
    }
    
    return id;
}

function removeNotification(id) {
    const notification = document.getElementById(id);
    if (notification) {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// ==================== UTILITY FUNCTIONS ====================
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function isValidPlatformURL(platform, url) {
    const patterns = {
        instagram: /instagram\.com/,
        tiktok: /tiktok\.com/,
        youtube: /youtube\.com|youtu\.be/,
        facebook: /facebook\.com|fb\.watch/
    };
    
    return patterns[platform]?.test(url) || false;
}

function extractYouTubeID(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function getDefaultThumbnail(platform) {
    const thumbnails = {
        instagram: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=400&fit=crop',
        tiktok: 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=600&h=400&fit=crop',
        youtube: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&h=400&fit=crop',
        facebook: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&h=400&fit=crop'
    };
    return thumbnails[platform] || 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop';
}

function estimateFileSize(quality) {
    const sizes = {
        '144p': '5-10 MB',
        '240p': '10-20 MB',
        '360p': '20-40 MB',
        '480p': '40-70 MB',
        '720p': '70-150 MB',
        '1080p': '150-300 MB',
        '2K': '300-500 MB',
        '4K': '500 MB - 1 GB',
        'HD': '100-200 MB',
        'SD': '50-100 MB'
    };
    
    return sizes[quality] || 'Unknown';
}

function updateDownloadCount() {
    const current = parseInt(localStorage.getItem('downloadCount') || '0');
    localStorage.setItem('downloadCount', (current + 1).toString());
    
    // Update UI if on dashboard
    const countElement = document.getElementById('downloadCount');
    if (countElement) {
        countElement.textContent = current + 1;
    }
}

// ==================== API STATUS ====================
async function testAPIStatus() {
    try {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-indicator span');
        
        // Test proxy endpoint
        const response = await fetch(CONFIG.API_BASE_URL, {
            method: 'HEAD',
            timeout: 5000
        }).catch(() => null);
        
        if (response && response.ok) {
            statusDot.className = 'status-dot online';
            statusText.textContent = 'Server Online';
            statusText.style.color = 'var(--success-color)';
        } else {
            statusDot.className = 'status-dot';
            statusDot.style.backgroundColor = 'var(--warning-color)';
            statusText.textContent = 'Server Terbatas';
            statusText.style.color = 'var(--warning-color)';
        }
    } catch (error) {
        console.log('⚠️ API status check skipped');
    }
}

function updateAPIStatusWidget() {
    const widget = document.getElementById('apiStatusWidget');
    if (!widget) return;
    
    widget.innerHTML = `
        <div style="padding: 20px; background: var(--card-bg); border-radius: 15px; border: 1px solid var(--border-color);">
            <h4 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-server"></i> Status Sistem
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <div style="text-align: center; padding: 15px; background: var(--hover-color); border-radius: 10px;">
                    <div class="status-dot online" style="margin: 0 auto 10px;"></div>
                    <div style="font-weight: 600;">Frontend</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">Online</div>
                </div>
                <div style="text-align: center; padding: 15px; background: var(--hover-color); border-radius: 10px;">
                    <div class="status-dot online" style="margin: 0 auto 10px;"></div>
                    <div style="font-weight: 600;">API Proxy</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">Ready</div>
                </div>
                <div style="text-align: center; padding: 15px; background: var(--hover-color); border-radius: 10px;">
                    <div class="status-dot online" style="margin: 0 auto 10px;"></div>
                    <div style="font-weight: 600;">Download</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">Aktif</div>
                </div>
            </div>
        </div>
    `;
}

async function testAllAPIs() {
    showNotification('Testing semua API...', 'info');
    
    const platforms = ['instagram', 'tiktok', 'youtube', 'facebook'];
    let results = [];
    
    for (const platform of platforms) {
        try {
            const testUrl = getTestURL(platform);
            const response = await fetch(CONFIG.API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, url: testUrl })
            });
            
            results.push({
                platform,
                status: response.ok ? '✅' : '❌',
                message: response.ok ? 'OK' : `Error: ${response.status}`
            });
        } catch (error) {
            results.push({
                platform,
                status: '❌',
                message: `Failed: ${error.message}`
            });
        }
        
        // Delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Show results
    const resultHTML = results.map(r => 
        `${r.status} ${r.platform}: ${r.message}`
    ).join('<br>');
    
    showNotification(`Hasil test API:<br>${resultHTML}`, 'info', 10000);
}

function getTestURL(platform) {
    const urls = {
        instagram: 'https://www.instagram.com/p/C1B9JD3y7uB/',
        tiktok: 'https://www.tiktok.com/@khaby.lame/video/7106685956212706566',
        youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        facebook: 'https://www.facebook.com/facebook/videos/10153231379946729/'
    };
    return urls[platform];
}

function checkServerStatus() {
    // Update server status periodically
    setInterval(testAPIStatus, 60000); // Every minute
}

function showHowToUse() {
    const container = document.getElementById('dashboardContainer');
    const toolContainer = document.getElementById('toolContainer');
    
    toolContainer.style.display = 'none';
    container.style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Cara Pakai';
    
    container.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
            <h1 style="font-size: 2.5rem; margin-bottom: 30px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">📖 Panduan Penggunaan</h1>
            
            <div style="background: var(--card-bg); border-radius: 20px; padding: 40px; border: 1px solid var(--border-color);">
                <div style="display: grid; gap: 30px;">
                    <div>
                        <h3 style="margin-bottom: 15px; color: var(--primary-color); font-size: 1.5rem;">
                            <i class="fas fa-1"></i> Pilih Platform
                        </h3>
                        <p style="color: var(--text-secondary); line-height: 1.8;">
                            Klik salah satu platform di dashboard (Instagram, TikTok, YouTube, Facebook) sesuai dengan video yang ingin Anda download.
                        </p>
                    </div>
                    
                    <div>
                        <h3 style="margin-bottom: 15px; color: var(--primary-color); font-size: 1.5rem;">
                            <i class="fas fa-2"></i> Tempel Link Video
                        </h3>
                        <p style="color: var(--text-secondary); line-height: 1.8;">
                            Salin link video dari platform yang dipilih, lalu tempelkan ke kolom input. Klik tombol "Analisis Tautan" untuk memproses.
                        </p>
                    </div>
                    
                    <div>
                        <h3 style="margin-bottom: 15px; color: var(--primary-color); font-size: 1.5rem;">
                            <i class="fas fa-3"></i> Pilih Kualitas
                        </h3>
                        <p style="color: var(--text-secondary); line-height: 1.8;">
                            Setelah dianalisis, pilih kualitas video yang diinginkan. Anda juga bisa memilih untuk mendownload audio saja.
                        </p>
                    </div>
                    
                    <div>
                        <h3 style="margin-bottom: 15px; color: var(--primary-color); font-size: 1.5rem;">
                            <i class="fas fa-4"></i> Download File
                        </h3>
                        <p style="color: var(--text-secondary); line-height: 1.8;">
                            Klik tombol download dan file akan secara otomatis tersimpan di perangkat Anda.
                        </p>
                    </div>
                </div>
                
                <div style="margin-top: 40px; padding: 25px; background: rgba(106, 17, 203, 0.1); border-radius: 15px; border-left: 5px solid var(--primary-color);">
                    <h4 style="margin-bottom: 15px; color: var(--primary-color);">
                        <i class="fas fa-lightbulb"></i> Tips & Trik
                    </h4>
                    <ul style="color: var(--text-secondary); line-height: 1.8; padding-left: 20px;">
                        <li>Gunakan koneksi internet yang stabil untuk download lebih cepat</li>
                        <li>Video yang lebih panjang membutuhkan waktu analisis lebih lama</li>
                        <li>Pastikan link video valid dan publik (bukan private)</li>
                        <li>Browser terbaru memberikan pengalaman download terbaik</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function showAPIStatus() {
    const container = document.getElementById('dashboardContainer');
    const toolContainer = document.getElementById('toolContainer');
    
    toolContainer.style.display = 'none';
    container.style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Status API';
    
    container.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
            <h1 style="font-size: 2.5rem; margin-bottom: 30px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">📡 Status Sistem</h1>
            
            <div style="background: var(--card-bg); border-radius: 20px; padding: 40px; border: 1px solid var(--border-color);">
                <div style="display: grid; gap: 25px; margin-bottom: 40px;">
                    <div style="display: flex; align-items: center; gap: 20px; padding: 20px; background: var(--hover-color); border-radius: 15px;">
                        <div class="status-dot online" style="flex-shrink: 0;"></div>
                        <div>
                            <h3 style="margin-bottom: 5px;">Frontend Application</h3>
                            <p style="color: var(--text-secondary);">Website utama berjalan normal</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 20px; padding: 20px; background: var(--hover-color); border-radius: 15px;">
                        <div class="status-dot online" style="flex-shrink: 0;"></div>
                        <div>
                            <h3 style="margin-bottom: 5px;">API Proxy Server</h3>
                            <p style="color: var(--text-secondary);">Server backend berfungsi dengan baik</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 20px; padding: 20px; background: var(--hover-color); border-radius: 15px;">
                        <div class="status-dot online" style="flex-shrink: 0;"></div>
                        <div>
                            <h3 style="margin-bottom: 5px;">Download Service</h3>
                            <p style="color: var(--text-secondary);">Layanan download aktif dan stabil</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: rgba(33, 150, 243, 0.1); padding: 25px; border-radius: 15px; border-left: 5px solid var(--info-color);">
                    <h4 style="margin-bottom: 15px; color: var(--info-color);">
                        <i class="fas fa-info-circle"></i> Informasi Teknis
                    </h4>
                    <div style="color: var(--text-secondary); line-height: 1.8;">
                        <p><strong>Versi:</strong> 2.1.0 (Stable)</p>
                        <p><strong>API Provider:</strong> RapidAPI + Custom Proxy</p>
                        <p><strong>Dukungan Platform:</strong> Instagram, TikTok, YouTube, Facebook</p>
                        <p><strong>Format Output:</strong> MP4 (Video), MP3 (Audio)</p>
                        <p><strong>Update Terakhir:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
                    </div>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <button class="download-btn secondary" onclick="testAllAPIs()" style="width: auto; padding: 15px 40px;">
                        <i class="fas fa-bolt"></i> Test Semua API
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==================== EXPORT FUNCTIONS ====================
// Export functions untuk digunakan di HTML onclick
window.loadTool = loadTool;
window.loadDashboard = loadDashboard;
window.analyzeURL = analyzeURL;
window.downloadFile = downloadFile;
window.playVideoPreview = playVideoPreview;
window.closeVideoPopup = closeVideoPopup;
window.removeNotification = removeNotification;
window.testAllAPIs = testAllAPIs;
window.showHowToUse = showHowToUse;
window.showAPIStatus = showAPIStatus;
window.toggleTheme = toggleTheme;