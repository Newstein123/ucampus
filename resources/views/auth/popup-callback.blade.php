<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication Complete</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f7fafd;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        .success-icon {
            color: #1abc60;
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .message {
            color: #333;
            margin-bottom: 1rem;
        }
        .loading {
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        @if($success)
            <div class="success-icon">✓</div>
            <div class="message">Authentication successful!</div>
            <div class="loading">Closing popup and redirecting...</div>
        @else
            <div class="success-icon" style="color: #e74c3c;">✗</div>
            <div class="message">Authentication failed!</div>
            <div class="loading">Closing popup...</div>
        @endif
    </div>

    <script>
        @if($success)
            // Store auth data in localStorage
            localStorage.setItem('social_auth_token', '{{ $token }}');
            localStorage.setItem('social_auth_user', '{{ $user }}');
            
            // Check if this is a popup window
            if (window.opener && !window.opener.closed) {
                console.log('Popup detected, sending message to parent');
                
                // This is a popup - try to notify parent window multiple times
                let messageSent = false;
                
                // Try postMessage first
                try {
                    window.opener.postMessage({
                        type: 'SOCIAL_AUTH_SUCCESS',
                        token: '{{ $token }}',
                        user: {!! $user !!}
                    }, '*');
                    messageSent = true;
                    console.log('PostMessage sent successfully');
                } catch (error) {
                    console.log('PostMessage failed due to COOP, trying localStorage');
                }
                
                // Also trigger storage events multiple times to ensure parent receives it
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        try {
                            // Trigger storage event
                            window.dispatchEvent(new StorageEvent('storage', {
                                key: 'social_auth_token',
                                newValue: '{{ $token }}',
                                url: window.location.href
                            }));
                            console.log('Storage event triggered', i + 1);
                        } catch (error) {
                            console.log('Storage event failed', i + 1);
                        }
                    }, i * 500); // Send at 0ms, 500ms, 1000ms
                }
                
                // Close popup after ensuring message is sent
                setTimeout(() => {
                    try {
                        console.log('Closing popup window');
                        window.close();
                    } catch (error) {
                        console.log('Could not close popup due to COOP restrictions');
                        // Fallback: redirect to home page
                        window.location.href = '/';
                    }
                }, 2000); // Increased delay to ensure message is sent
            } else {
                // This is a direct callback (not popup) - redirect to home page
                console.log('Direct callback detected, redirecting to home page');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
            
        @else
            // Handle failed authentication
            if (window.opener && !window.opener.closed) {
                try {
                    window.opener.postMessage({
                        type: 'SOCIAL_AUTH_ERROR',
                        message: 'Authentication failed'
                    }, '*');
                } catch (error) {
                    console.log('PostMessage failed due to COOP');
                }
            }
            
            // Redirect to login page on failure
            setTimeout(() => {
                try {
                    window.close();
                } catch (error) {
                    window.location.href = '/login';
                }
            }, 1500);
        @endif
    </script>
</body>
</html>
