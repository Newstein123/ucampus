<!DOCTYPE html>
<html>
<head>
    <title>Reset Password</title>
</head>
<body>
    <h1>Reset Your Password</h1>
    <p>Hello,</p>
    <p>You are receiving this email because we received a password reset request for your account.</p>
    <p>Please click the button below to reset your password:</p>
    
    <a href="{{ $resetUrl }}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Reset Password
    </a>

    <p>If you did not request a password reset, no further action is required.</p>
    
    <p>This password reset link will expire in 60 minutes.</p>
    
    <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
    <p>{{ $resetUrl }}</p>
    
    <p>Regards,<br>{{ config('app.name') }}</p>
</body>
</html>