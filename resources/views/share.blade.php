<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <!-- Primary Meta Tags -->
    <title>{{ $title }} | U Campus</title>
    <meta name="title" content="{{ $title }}">
    <meta name="description" content="{{ $description }}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="{{ $url }}">
    <meta property="og:title" content="{{ $title }}">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:image" content="{{ $image }}">
    <meta property="og:site_name" content="U Campus">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ $url }}">
    <meta property="twitter:title" content="{{ $title }}">
    <meta property="twitter:description" content="{{ $description }}">
    <meta property="twitter:image" content="{{ $image }}">
    
    <!-- Theme and Icons -->
    <meta name="theme-color" content="#1F8505">
    <link rel="icon" href="{{ asset('favicon.ico') }}">
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
        }
        .loading-container {
            text-align: center;
            padding: 40px;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e0e0e0;
            border-top-color: #1F8505;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loading-text {
            color: #666;
            font-size: 16px;
        }
        .redirect-link {
            color: #1F8505;
            text-decoration: none;
            font-weight: 500;
        }
        .redirect-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">Redirecting you to U Campus...</p>
        <p class="loading-text">
            <a href="{{ $detailUrl }}" class="redirect-link">Click here if you're not redirected</a>
        </p>
    </div>
    
    <script>
        // Redirect to the full detail page after a brief delay
        setTimeout(function() {
            window.location.href = "{{ $detailUrl }}";
        }, 500);
    </script>
</body>
</html>
