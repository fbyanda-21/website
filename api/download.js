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
            
            // Simulate API response with demo data
            const demoData = {
                success: true,
                data: {
                    title: `Video ${platform} - Download Ready`,
                    thumbnail: getThumbnail(platform),
                    duration: '2:45',
                    author: 'Social Media User',
                    videos: [
                        {
                            quality: 'HD',
                            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                            size: '25 MB'
                        },
                        {
                            quality: 'SD',
                            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                            size: '15 MB'
                        }
                    ],
                    audio: {
                        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                    }
                }
            };
            
            return res.status(200).json(demoData);
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }
    
    // Handle GET requests for direct download
    if (req.method === 'GET' && req.query.url) {
        try {
            const videoUrl = decodeURIComponent(req.query.url);
            
            // Redirect to video URL for download
            return res.redirect(302, videoUrl);
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Download error'
            });
        }
    }
    
    return res.status(404).json({
        success: false,
        error: 'Not found'
    });
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
