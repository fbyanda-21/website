<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Your RapidAPI Key
define('RAPIDAPI_KEY', '15b2e1d1d0msh0ac4048b4645f31p1f6dc9jsn938e039327f3');

// API Endpoints configuration
$apiConfig = [
    'instagram' => [
        'url' => 'https://instagram-downloader-api3.p.rapidapi.com/download',
        'method' => 'GET',
        'host' => 'instagram-downloader-api3.p.rapidapi.com'
    ],
    'tiktok' => [
        'url' => 'https://tiktok-video-no-watermark2.p.rapidapi.com/',
        'method' => 'GET',
        'host' => 'tiktok-video-no-watermark2.p.rapidapi.com'
    ],
    'youtube' => [
        'url' => 'https://youtube-video-download-info.p.rapidapi.com/dl',
        'method' => 'GET',
        'host' => 'youtube-video-download-info.p.rapidapi.com'
    ],
    'facebook' => [
        'url' => 'https://facebook-reel-and-video-downloader.p.rapidapi.com/api/facebookVideo',
        'method' => 'GET',
        'host' => 'facebook-reel-and-video-downloader.p.rapidapi.com'
    ]
];

// Get request data
$input = json_decode(file_get_contents('php://input'), true);
$platform = isset($input['platform']) ? $input['platform'] : '';
$url = isset($input['url']) ? $input['url'] : '';

// Validate input
if (empty($platform) || empty($url)) {
    echo json_encode([
        'success' => false,
        'error' => 'Platform and URL are required'
    ]);
    exit();
}

if (!isset($apiConfig[$platform])) {
    echo json_encode([
        'success' => false,
        'error' => 'Platform not supported'
    ]);
    exit();
}

try {
    // Prepare API request
    $config = $apiConfig[$platform];
    
    // Build query parameters
    $params = [];
    switch ($platform) {
        case 'instagram':
        case 'facebook':
            $params['url'] = $url;
            break;
        case 'tiktok':
            $params['url'] = $url;
            $params['hd'] = '1';
            break;
        case 'youtube':
            // Extract YouTube video ID
            preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $url, $matches);
            $videoId = $matches[1] ?? '';
            if (empty($videoId)) {
                throw new Exception('Invalid YouTube URL');
            }
            $params['id'] = $videoId;
            break;
    }
    
    // Build API URL
    $apiUrl = $config['url'] . '?' . http_build_query($params);
    
    // Initialize cURL
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $apiUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => [
            'X-RapidAPI-Key: ' . RAPIDAPI_KEY,
            'X-RapidAPI-Host: ' . $config['host'],
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        ]
    ]);
    
    // Execute request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    
    curl_close($ch);
    
    if ($curlError) {
        throw new Exception('CURL Error: ' . $curlError);
    }
    
    if ($httpCode !== 200) {
        throw new Exception('API returned HTTP ' . $httpCode);
    }
    
    // Parse response
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON response from API');
    }
    
    // Format response based on platform
    $formattedData = formatResponse($platform, $data);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'data' => $formattedData
    ]);
    
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

function formatResponse($platform, $data) {
    switch ($platform) {
        case 'instagram':
            return [
                'title' => $data['title'] ?? 'Instagram Video',
                'thumbnail' => $data['thumbnail'] ?? $data['image'] ?? '',
                'duration' => $data['duration'] ?? 'N/A',
                'author' => $data['author'] ?? $data['username'] ?? 'Instagram User',
                'videos' => isset($data['video']) ? [[
                    'quality' => 'HD',
                    'url' => $data['video']
                ]] : [],
                'audio' => isset($data['audio']) ? [
                    'url' => $data['audio']
                ] : null
            ];
            
        case 'tiktok':
            return [
                'title' => $data['title'] ?? 'TikTok Video',
                'thumbnail' => $data['cover'] ?? $data['thumbnail'] ?? '',
                'duration' => $data['duration'] ?? 'N/A',
                'author' => $data['author']['nickname'] ?? $data['author_name'] ?? 'TikTok User',
                'videos' => isset($data['video']) ? [[
                    'quality' => 'HD',
                    'url' => $data['video']
                ]] : [],
                'music' => isset($data['music']) ? [
                    'url' => $data['music']
                ] : null
            ];
            
        case 'youtube':
            return [
                'title' => $data['title'] ?? 'YouTube Video',
                'thumbnail' => $data['thumbnail'] ?? '',
                'duration' => $data['duration'] ?? 'N/A',
                'author' => $data['author'] ?? $data['channel'] ?? 'YouTube Channel',
                'videos' => isset($data['video']) ? [[
                    'quality' => 'HD',
                    'url' => $data['video']
                ]] : [],
                'audio' => isset($data['audio']) ? [
                    'url' => $data['audio']
                ] : null
            ];
            
        case 'facebook':
            return [
                'title' => $data['title'] ?? 'Facebook Video',
                'thumbnail' => $data['thumbnail'] ?? '',
                'duration' => $data['duration'] ?? 'N/A',
                'author' => $data['author'] ?? $data['page_name'] ?? 'Facebook User',
                'videos' => isset($data['video']) ? [[
                    'quality' => 'HD',
                    'url' => $data['video']
                ]] : [],
                'audio' => isset($data['audio']) ? [
                    'url' => $data['audio']
                ] : null
            ];
            
        default:
            return $data;
    }
}
?>