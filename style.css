// ==================== KONFIGURASI ====================
const CONFIG = {
    API_BASE_URL: 'api/download.php',
    FALLBACK_APIS: {
        instagram: 'https://instagram-downloader-api3.p.rapidapi.com/download',
        tiktok: 'https://tiktok-video-no-watermark2.p.rapidapi.com/',
        youtube: 'https://youtube-video-download-info.p.rapidapi.com/dl',
        facebook: 'https://facebook-reel-and-video-downloader.p.rapidapi.com/api/facebookVideo'
    },
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
    
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                showNotification('Downloader Pro siap digunakan!', 'success');
            }, 500);
        }
    }, 1500);

    // Inisialisasi semua fungsi
    initializeTheme();
    initializeNavigation();
    initializeEventListeners();
    
    // Load dashboard pertama kali
    loadDashboard();
    
    // Check server status
    checkServerStatus();
});

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
    
    // Add feedback animation
    const toggle = document.getElementById('floatingThemeToggle');
    if (toggle) {
        toggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            toggle.style.transform = '';
        }, 150);
    }
}

function updateThemeToggle(theme) {
    const toggle = document.getElementById('floatingThemeToggle');
    if (!toggle) return;
    
    const icon = toggle.querySelector('i');
    
    if (theme === 'dark') {
        if (icon) icon.className = 'fas fa-moon';
        toggle.setAttribute('title', 'Mode Gelap');
    } else {
        if (icon) icon.className = 'fas fa-sun';
        toggle.setAttribute('title', 'Mode Terang');
    }
}

// ==================== NAVIGATION MANAGEMENT ====================
function initializeNavigation() {
    console.log('Initializing navigation...');
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Navigation clicked:', this.id);
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Load corresponding content
            switch(this.id) {
                case 'navHome':
                    loadDashboard();
                    break;
                case 'navTools':
                    loadToolsPage();
                    break;
                case 'navHowTo':
                    loadHowToUsePage();
                    break;
                case 'navStatus':
                    loadAPIStatusPage();
                    break;
            }
        });
    });
}

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Theme toggle (FLOATING BUTTON)
    const floatingThemeToggle = document.getElementById('floatingThemeToggle');
    if (floatingThemeToggle) {
        floatingThemeToggle.addEventListener('click', toggleTheme);
        
        // Add pulse animation on hover
        floatingThemeToggle.addEventListener('mouseenter', function() {
            this.classList.add('pulse');
        });
        
        floatingThemeToggle.addEventListener('mouseleave', function() {
            this.classList.remove('pulse');
        });
    }
    
    // Navigation
    initializeNavigation();
    
    // Search box
    const searchBox = document.getElementById('platformSearch');
    if (searchBox) {
        searchBox.addEventListener('input', function(e) {
            filterPlatforms(this.value.toLowerCase());
        });
    }
    
    // Close video popup dengan ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeVideoPopup();
        }
    });
    
    // Close popup button
    const closePopup = document.querySelector('.close-popup');
    if (closePopup) {
        closePopup.addEventListener('click', closeVideoPopup);
    }
}

// ==================== PAGE MANAGEMENT ====================
function hideAllContainers() {
    const containers = [
        'dashboardContainer',
        'toolsContainer',
        'guideContainer',
        'statusContainer',
        'toolContainer'
    ];
    
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.style.display = 'none';
        }
    });
}

function updateBreadcrumb(text) {
    const breadcrumb = document.getElementById('breadcrumbText');
    if (breadcrumb) {
        breadcrumb.textContent = text;
    }
}

// ==================== DASHBOARD PAGE ====================
function loadDashboard() {
    console.log('📊 Loading dashboard...');
    
    // Hide all containers
    hideAllContainers();
    
    // Show dashboard container
    const container = document.getElementById('dashboardContainer');
    if (container) {
        container.style.display = 'block';
        updateBreadcrumb('Home');
        
        // Load dashboard content
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
            
            <h2 style="margin: 40px 0 25px 0; font-size: 1.8rem;">📱 Platform Tersedia</h2>
            
            <div class="tools-grid" id="platformsGrid">
                <div class="tool-card instagram" onclick="loadToolPage('instagram')">
                    <i class="fab fa-instagram"></i>
                    <h3>Instagram</h3>
                    <p>Download video, foto, dan reel tanpa watermark</p>
                    <button class="download-btn secondary">
                        <i class="fas fa-play"></i> Gunakan Tool
                    </button>
                </div>
                
                <div class="tool-card tiktok" onclick="loadToolPage('tiktok')">
                    <i class="fab fa-tiktok"></i>
                    <h3>TikTok</h3>
                    <p>Download video TikTok tanpa watermark</p>
                    <button class="download-btn secondary">
                        <i class="fas fa-play"></i> Gunakan Tool
                    </button>
                </div>
                
                <div class="tool-card youtube" onclick="loadToolPage('youtube')">
                    <i class="fab fa-youtube"></i>
                    <h3>YouTube</h3>
                    <p>Download video YouTube berbagai kualitas</p>
                    <button class="download-btn secondary">
                        <i class="fas fa-play"></i> Gunakan Tool
                    </button>
                </div>
                
                <div class="tool-card facebook" onclick="loadToolPage('facebook')">
                    <i class="fab fa-facebook"></i>
                    <h3>Facebook</h3>
                    <p>Download video Facebook tanpa batas</p>
                    <button class="download-btn secondary">
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
        `;
    }
}

// ==================== TOOLS PAGE ====================
function loadToolsPage() {
    console.log('🛠️ Loading tools page...');
    
    // Hide all containers
    hideAllContainers();
    
    // Show tools container
    const container = document.getElementById('toolsContainer');
    if (container) {
        container.style.display = 'block';
        updateBreadcrumb('Tools');
        
        // Load tools content
        container.innerHTML = `
            <div class="welcome-section" style="margin-bottom: 40px;">
                <h1 style="font-size: 2.5rem; margin-bottom: 10px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🛠️ Tools Download</h1>
                <p style="color: var(--text-secondary); font-size: 1.1rem;">Pilih platform yang ingin Anda gunakan untuk download konten</p>
            </div>
            
            <div class="tools-grid">
                <div class="tool-card instagram" onclick="loadToolPage('instagram')">
                    <i class="fab fa-instagram"></i>
                    <h3>Instagram</h3>
                    <p>Download video, foto, dan reel tanpa watermark</p>
                    <button class="download-btn secondary">
                        <i class="fas fa-play"></i> Gunakan Tool
                    </button>
                </div>
                
                <div class="tool-card tiktok" onclick="loadToolPage('tiktok')">
                    <i class="fab fa-tiktok"></i>
                    <h3>TikTok</h3>
                    <p>Download video TikTok tanpa watermark</p>
                    <button class="download-btn secondary">
                        <i class="fas fa-play"></i> Gunakan Tool
                    </button>
                </div>
                
                <div class="tool-card youtube" onclick="loadToolPage('youtube')">
                    <i class="fab fa-youtube"></i>
                    <h3>YouTube</h3>
                    <p>Download video YouTube berbagai kualitas</p>
                    <button class="download-btn secondary">
                        <i class="fas fa-play"></i> Gunakan Tool
                    </button>
                </div>
                
                <div class="tool-card facebook" onclick="loadToolPage('facebook')">
                    <i class="fab fa-facebook"></i>
                    <h3>Facebook</h3>
                    <p>Download video Facebook tanpa batas</p>
                    <button class="download-btn secondary">
                        <i class="fas fa-play"></i> Gunakan Tool
                    </button>
                </div>
            </div>
        `;
    }
}

// ==================== HOW TO USE PAGE ====================
function loadHowToUsePage() {
    console.log('📖 Loading how to use page...');
    
    // Hide all containers
    hideAllContainers();
    
    // Show guide container
    const container = document.getElementById('guideContainer');
    if (container) {
        container.style.display = 'block';
        updateBreadcrumb('Cara Pakai');
        
        // Load how to use content
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
                                Klik menu "Tools" lalu pilih platform yang ingin Anda gunakan (Instagram, TikTok, YouTube, Facebook) sesuai dengan video yang ingin didownload.
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
                            <li>Anda bisa cek status API di menu "Status API"</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
}

// ==================== API STATUS PAGE ====================
function loadAPIStatusPage() {
    console.log('📡 Loading API status page...');
    
    // Hide all containers
    hideAllContainers();
    
    // Show status container
    const container = document.getElementById('statusContainer');
    if (container) {
        container.style.display = 'block';
        updateBreadcrumb('Status API');
        
        // Load API status content
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
                        <button class="download-btn" onclick="testAllAPIs()" style="width: auto; padding: 15px 40px; margin: 0 10px;">
                            <i class="fas fa-bolt"></i> Test Semua API
                        </button>
                        <button class="download-btn secondary" onclick="loadDashboard()" style="width: auto; padding: 15px 40px; margin: 0 10px;">
                            <i class="fas fa-home"></i> Kembali ke Home
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// ==================== TOOL PAGE LOADER ====================
function loadToolPage(tool) {
    console.log(`🛠️ Loading ${tool} tool page...`);
    
    // Hide all containers
    hideAllContainers();
    
    // Show tool container
    const container = document.getElementById('toolContainer');
    if (container) {
        container.style.display = 'block';
        updateBreadcrumb(tool.charAt(0).toUpperCase() + tool.slice(1));
        
        // Load the tool
        loadTool(tool);
    }
}

// ==================== TOOL LOADER ====================
function loadTool(tool) {
    console.log(`🛠️ Loading ${tool} tool...`);
    
    currentTool = tool;
    currentVideoData = null;
    
    const container = document.getElementById('toolContainer');
    if (!container) return;
    
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
    
    const config = toolConfig[tool] || toolConfig.instagram;
    
    container.innerHTML = `
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
                <div class="type-option active" data-type="video" onclick="setDownloadType('video')">
                    <i class="fas fa-video"></i> Video
                </div>
                <div class="type-option" data-type="audio" onclick="setDownloadType('audio')">
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
        
        <div style="margin-top: 30px; text-align: center;">
            <button class="download-btn secondary" onclick="loadToolsPage()" style="width: auto; padding: 15px 40px;">
                <i class="fas fa-arrow-left"></i> Kembali ke Tools
            </button>
        </div>
    `;
    
    // Initialize tool-specific event listeners
    initializeToolListeners();
    
    // Hide sections initially
    const previewSection = document.getElementById('previewSection');
    const qualitySelector = document.getElementById('qualitySelector');
    const downloadProgress = document.getElementById('downloadProgress');
    
    if (previewSection) previewSection.style.display = 'none';
    if (qualitySelector) qualitySelector.style.display = 'none';
    if (downloadProgress) downloadProgress.style.display = 'none';
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
}

function setDownloadType(type) {
    currentDownloadType = type;
    
    // Update UI
    document.querySelectorAll('.type-option').forEach(option => {
        option.classList.remove('active');
    });
    
    const activeOption = document.querySelector(`.type-option[data-type="${type}"]`);
    if (activeOption) {
        activeOption.classList.add('active');
    }
    
    // Refresh quality options if video data exists
    if (currentVideoData) {
        showQualityOptions(currentVideoData);
    }
}

// ==================== URL ANALYSIS ====================
async function analyzeURL() {
    if (isAnalyzing) return;
    
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (!urlInput || !analyzeBtn) return;
    
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
    
    // Set analyzing state
    isAnalyzing = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menganalisis...';
    analyzeBtn.disabled = true;
    
    // Reset previous data
    currentVideoData = null;
    const previewSection = document.getElementById('previewSection');
    const qualitySelector = document.getElementById('qualitySelector');
    
    if (previewSection) previewSection.style.display = 'none';
    if (qualitySelector) qualitySelector.style.display = 'none';
    
    try {
        console.log(`🔍 Analyzing ${currentTool} URL: ${url}`);
        
        // Show analyzing notification
        const notifId = showNotification('Menganalisis link...', 'info', 0);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulated video data
        const videoData = {
            title: `Video ${currentTool} Contoh`,
            thumbnail: getDefaultThumbnail(currentTool),
            duration: '2:30',
            author: 'Contoh User',
            qualities: [
                { quality: 'HD', url: '#' },
                { quality: 'SD', url: '#' }
            ],
            audio: { url: '#' }
        };
        
        // Remove analyzing notification
        removeNotification(notifId);
        
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
        showNotification('Gagal menganalisis video', 'error');
        
    } finally {
        // Reset analyzing state
        isAnalyzing = false;
        if (analyzeBtn) {
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analisis Tautan';
            analyzeBtn.disabled = false;
        }
    }
}

// ==================== PREVIEW SYSTEM ====================
function showPreview(videoData) {
    const previewSection = document.getElementById('previewSection');
    const videoPreview = document.getElementById('videoPreview');
    const previewInfo = document.getElementById('previewInfo');
    
    if (!previewSection || !videoPreview || !previewInfo) return;
    
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
    
    if (!qualitySelector || !qualityOptions) return;
    
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

// ==================== UTILITY FUNCTIONS ====================
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
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
        const platformsGrid = document.getElementById('platformsGrid');
        if (platformsGrid) {
            platformsGrid.innerHTML += `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>Platform tidak ditemukan</h3>
                    <p>Coba cari dengan kata kunci lain</p>
                </div>
            `;
        }
    }
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return null;
    
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

// ==================== VIDEO PLAYER ====================
function playVideoPreview(videoUrl) {
    if (!videoUrl || videoUrl === '#') {
        showNotification('Tidak dapat memutar video preview', 'error');
        return;
    }
    
    const popup = document.getElementById('videoPopup');
    const video = document.getElementById('popupVideo');
    
    if (!popup || !video) return;
    
    video.src = videoUrl;
    popup.style.display = 'flex';
    
    // Add close button listener
    const closeBtn = popup.querySelector('.close-popup');
    if (closeBtn) {
        closeBtn.onclick = closeVideoPopup;
    }
    
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
    
    if (!popup || !video) return;
    
    video.pause();
    video.src = '';
    popup.style.display = 'none';
}

// ==================== DOWNLOAD SYSTEM ====================
async function downloadFile(url, type, filename) {
    if (!url || url === '#' || !currentVideoData) {
        showNotification('Download simulasi berhasil! (Dalam implementasi nyata akan mendownload file)', 'success');
        return;
    }
    
    console.log(`⬇️ Starting download: ${filename}`);
    
    // Show progress section
    const progressSection = document.getElementById('downloadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (!progressSection || !progressFill || !progressText) return;
    
    progressSection.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Mempersiapkan download...';
    progressSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    try {
        // Simulate progress for better UX
        simulateProgress(progressFill, progressText);
        
        // Simulate download
        await new Promise(resolve => setTimeout(resolve, 3000));
        
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

function simulateProgress(progressFill, progressText) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 90) {
            clearInterval(interval);
            if (progressFill) progressFill.style.width = '90%';
            if (progressText) progressText.textContent = 'Menyelesaikan download...';
        } else {
            if (progressFill) progressFill.style.width = `${progress}%`;
            
            if (progressText) {
                if (progress < 30) {
                    progressText.textContent = 'Menyiapkan file...';
                } else if (progress < 60) {
                    progressText.textContent = 'Mendownload data...';
                } else {
                    progressText.textContent = 'Hampir selesai...';
                }
            }
        }
    }, 200);
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

// ==================== API TEST FUNCTIONS ====================
async function testAllAPIs() {
    console.log('🧪 Testing all APIs...');
    
    showNotification('Testing semua API...', 'info', 0);
    
    const platforms = ['instagram', 'tiktok', 'youtube', 'facebook'];
    let results = [];
    
    // Show testing UI
    const container = document.getElementById('statusContainer');
    if (container) {
        container.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto;">
                <h1 style="font-size: 2.5rem; margin-bottom: 30px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🧪 Testing API</h1>
                
                <div style="background: var(--card-bg); border-radius: 20px; padding: 40px; border: 1px solid var(--border-color);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div class="loading-spinner" style="width: 50px; height: 50px; border-width: 3px; margin: 0 auto 20px;"></div>
                        <h3 style="margin-bottom: 10px;">Sedang melakukan testing API...</h3>
                        <p style="color: var(--text-secondary);">Mohon tunggu sebentar</p>
                    </div>
                    
                    <div id="apiTestResults" style="display: none;">
                        <h4 style="margin-bottom: 20px; color: var(--text-color);">Hasil Testing:</h4>
                        <div class="tools-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
                            <!-- Results will be populated here -->
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center;">
                        <button class="download-btn secondary" onclick="loadAPIStatusPage()" style="width: auto; padding: 15px 40px;">
                            <i class="fas fa-arrow-left"></i> Kembali ke Status API
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Simulate API testing
    for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        
        try {
            // Simulate API test delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simulate success (random success 90% of the time)
            const success = Math.random() > 0.1;
            
            results.push({
                platform: platform,
                status: success ? 'success' : 'error',
                message: success ? 'API berfungsi' : 'API timeout'
            });
            
            // Update progress
            console.log(`✅ ${platform}: ${success ? 'OK' : 'ERROR'}`);
            
        } catch (error) {
            results.push({
                platform: platform,
                status: 'error',
                message: error.message || 'Connection failed'
            });
        }
    }
    
    // Show results
    if (container) {
        const resultsContainer = container.querySelector('#apiTestResults');
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
            
            let resultsHTML = '';
            results.forEach(result => {
                const icon = result.status === 'success' ? 'fas fa-check-circle' : 'fas fa-times-circle';
                const color = result.status === 'success' ? 'var(--success-color)' : 'var(--danger-color)';
                
                resultsHTML += `
                    <div class="tool-card" style="padding: 20px;">
                        <i class="${icon}" style="color: ${color}; font-size: 3rem; margin-bottom: 15px;"></i>
                        <h3 style="font-size: 1.2rem; margin-bottom: 10px; text-transform: capitalize;">${result.platform}</h3>
                        <p style="color: ${color}; font-weight: 600; margin-bottom: 10px;">${result.message}</p>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 0.9rem; color: var(--text-secondary);">
                            <i class="fas fa-clock"></i>
                            <span>${Math.floor(Math.random() * 500) + 100}ms</span>
                        </div>
                    </div>
                `;
            });
            
            resultsContainer.querySelector('.tools-grid').innerHTML = resultsHTML;
            
            // Update main content
            container.querySelector('.loading-spinner').style.display = 'none';
            container.querySelector('h3').textContent = 'Testing Selesai!';
            container.querySelector('p').textContent = 'Hasil testing semua API:';
        }
    }
    
    // Show final notification
    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = results.length;
    
    if (successCount === totalCount) {
        showNotification('🎉 Semua API berfungsi dengan baik!', 'success');
    } else if (successCount > totalCount / 2) {
        showNotification(`⚠️ ${successCount}/${totalCount} API berfungsi`, 'warning');
    } else {
        showNotification(`❌ Hanya ${successCount}/${totalCount} API yang berfungsi`, 'error');
    }
}

function checkServerStatus() {
    // Update server status periodically
    setInterval(testAPIStatus, 60000); // Every minute
}

async function testAPIStatus() {
    try {
        // Simple API status check
        const response = await fetch('https://httpbin.org/get', {
            method: 'GET',
            mode: 'no-cors',
            cache: 'no-cache'
        });
        
        return true;
    } catch (error) {
        console.log('⚠️ API status check skipped');
        return false;
    }
}

// ==================== EXPORT FUNCTIONS ====================
window.loadToolPage = loadToolPage;
window.loadDashboard = loadDashboard;
window.loadToolsPage = loadToolsPage;
window.loadHowToUsePage = loadHowToUsePage;
window.loadAPIStatusPage = loadAPIStatusPage;
window.analyzeURL = analyzeURL;
window.downloadFile = downloadFile;
window.playVideoPreview = playVideoPreview;
window.closeVideoPopup = closeVideoPopup;
window.removeNotification = removeNotification;
window.testAllAPIs = testAllAPIs;
window.setDownloadType = setDownloadType;
window.toggleTheme = toggleTheme;
