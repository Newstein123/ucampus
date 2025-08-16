<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication Successful</title>
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
            max-width: 400px;
        }
        .success-icon {
            color: #1abc60;
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .message {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1.2rem;
        }
        .subtitle {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 2rem;
        }
        .button {
            background-color: #1abc60;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            text-decoration: none;
            display: inline-block;
        }
        .button:hover {
            background-color: #168f48;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✓</div>
        <div class="message">Authentication Successful!</div>
        <div class="subtitle">
            You have been successfully logged in. You can now close this window and return to the main application.
        </div>
        <button class="button" onclick="window.close()">Close Window</button>
        <br><br>
        <a href="/" class="button">Go to Home</a>
    </div>

    <script>
        // Try to close the window automatically
        setTimeout(() => {
            try {
                window.close();
            } catch (error) {
                console.log('Could not close window automatically');
            }
        }, 3000);
    </script>
</body>
</html>

