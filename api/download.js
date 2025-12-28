export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Handle GET requests (for testing)
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            message: 'Download API is working',
            endpoint: '/api/download',
            method: 'POST',
            parameters: {
                platform: 'instagram|tiktok|youtube|facebook',
                url: 'video_url'
            }
        });
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

// ... (fungsi-fungsi helper tetap sama)
