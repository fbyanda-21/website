export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Handle POST requests for analysis
    if (req.method === 'POST') {
        try {
            const { platform, url } = req.body;
            
            if (!platform || !url) {
                return res.status(400).json({
                    success: false,
                    error: 'Platform dan URL diperlukan'
                });
            }
            
            console.log(`Processing ${platform} download for: ${url}`);
            
            // Simulate API processing
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Generate video info based on URL
            const videoInfo = generateVideoInfo(platform, url);
            
            return res.status(200).json({
                success: true,
                data: videoInfo,
                originalUrl: url,
                platform: platform,
                note: 'Video siap untuk di-download'
            });
            
        } catch (error) {
            console.error('API Error:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Gagal memproses video',
                note: 'Silakan coba dengan link yang berbeda'
            });
        }
    }
    
    return res.status(404).json({
        success: false,
        error: 'Endpoint tidak ditemukan'
    });
}

function generateVideoInfo(platform, url) {
    const videoData = {
        title: getVideoTitle(platform, url),
        thumbnail: getThumbnail(platform),
        duration: getRandomDuration(),
        author: getRandomAuthor(),
        originalUrl: url,
        videos: [],
        audio: null
    };
    
    // Generate download URLs based on platform
    const downloadUrls = generateDownloadUrls(platform, url);
    
    downloadUrls.forEach((link, index) => {
        videoData.videos.push({
            quality: link.quality,
            url: link.url,
            size: estimateFileSize(link.quality),
            isExternal: true
        });
    });
    
    return videoData;
}

function getVideoTitle(platform, url) {
    const titles = {
        instagram: 'Instagram Video',
        tiktok: 'TikTok Video',
        youtube: 'YouTube Video',
        facebook: 'Facebook Video'
    };
    
    // Extract some info from URL if possible
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        
        if (path.includes('/reel/')) return 'Instagram Reel';
        if (path.includes('/reels/')) return 'Instagram Reel';
        if (path.includes('/p/')) return 'Instagram Post';
        if (path.includes('/tv/')) return 'Instagram TV';
        if (path.includes('/watch?v=')) return 'YouTube Video';
        if (path.includes('/shorts/')) return 'YouTube Shorts';
        if (path.includes('/@')) return `${platform} User Video`;
    } catch (e) {
        // Ignore URL parsing errors
    }
    
    return titles[platform] || 'Social Media Video';
}

function getThumbnail(platform) {
    const thumbnails = {
        instagram: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=400&fit=crop',
        tiktok: 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=600&h=400&fit=crop',
        youtube: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&h=400&fit=crop',
        facebook: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&h=400&fit=crop'
    };
    return thumbnails[platform] || 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop';
}

function getRandomDuration() {
    const durations = ['0:15', '0:30', '1:15', '2:30', '3:45', '4:20', '5:10'];
    return durations[Math.floor(Math.random() * durations.length)];
}

function getRandomAuthor() {
    const authors = [
        'Social Media User',
        'Content Creator',
        'Influencer',
        'Video Uploader',
        'Public Figure',
        'Creator'
    ];
    return authors[Math.floor(Math.random() * authors.length)];
}

function generateDownloadUrls(platform, originalUrl) {
    const encodedUrl = encodeURIComponent(originalUrl);
    const urls = [];
    
    switch (platform) {
        case 'instagram':
            urls.push({
                quality: 'HD',
                url: `https://downloadgram.org/video-downloader.php?url=${encodedUrl}`
            });
            urls.push({
                quality: 'SD',
                url: `https://igram.io/i/instagram-downloader.php?url=${encodedUrl}`
            });
            break;
            
        case 'tiktok':
            urls.push({
                quality: 'HD',
                url: `https://snaptik.app/en?url=${encodedUrl}`
            });
            urls.push({
                quality: 'SD',
                url: `https://ssstik.io?url=${encodedUrl}`
            });
            break;
            
        case 'youtube':
            urls.push({
                quality: 'HD',
                url: `https://yt5s.com/en?q=${encodedUrl}`
            });
            urls.push({
                quality: 'SD',
                url: `https://y2mate.com/youtube/${encodedUrl}`
            });
            break;
            
        case 'facebook':
            urls.push({
                quality: 'HD',
                url: `https://fbdown.net/download.php?url=${encodedUrl}`
            });
            urls.push({
                quality: 'SD',
                url: `https://getfbstuff.com/fbdown?url=${encodedUrl}`
            });
            break;
            
        default:
            urls.push({
                quality: 'HD',
                url: originalUrl
            });
    }
    
    return urls;
}

function estimateFileSize(quality) {
    const sizes = {
        'HD': '50-150 MB',
        'SD': '20-50 MB'
    };
    return sizes[quality] || 'Unknown';
                          }
