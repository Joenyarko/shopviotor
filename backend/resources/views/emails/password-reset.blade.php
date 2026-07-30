<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; color: #1a1a1a; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: #1a1a1a; padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; color: #f5c000; font-weight: 900; }
        .body { padding: 40px 32px; text-align: center; }
        .btn { display: inline-block; background: #f5c000; color: #1a1a1a; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 16px; margin: 24px 0; }
        .warning { background: #fff8e1; border: 1px solid #f5c000; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #555; margin-top: 24px; text-align: left; }
        .url-box { background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; font-size: 11px; word-break: break-all; color: #666; text-align: left; margin-top: 16px; }
        .footer { background: #f5f5f5; color: #888; text-align: center; padding: 20px; font-size: 12px; }
        .footer a { color: #f5c000; text-decoration: none; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🛍️ Shop Viotor</h1>
    </div>
    <div class="body">
        <h2 style="font-size:22px; margin-bottom:8px;">Reset Your Password</h2>
        <p style="color:#666; font-size:14px;">Hi <strong>{{ $user->first_name }}</strong>, we received a request to reset your password.</p>
        <p style="color:#666; font-size:14px;">Click the button below to set a new password. This link expires in <strong>60 minutes</strong>.</p>

        <a href="{{ $resetUrl }}" class="btn">Reset My Password</a>

        <p style="font-size:13px; color:#999;">If the button doesn't work, copy and paste this link:</p>
        <div class="url-box">{{ $resetUrl }}</div>

        <div class="warning">
            ⚠️ <strong>Didn't request this?</strong> Ignore this email — your password won't change and this link will expire automatically.
        </div>
    </div>
    <div class="footer">
        <p>© {{ date('Y') }} Shop Viotor — The ATU Student Marketplace</p>
        <p><a href="{{ config('app.frontend_url', 'http://localhost:5173') }}">Visit Shop Viotor</a></p>
    </div>
</div>
</body>
</html>
