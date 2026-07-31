<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 40px 0; margin: 0;">
    <div style="max-w-xl; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to SHOP VIOTOR!</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Thank you for registering. To complete your registration and secure your account, please use the following verification code:
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 30px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #f59e0b;">{{ $otp }}</span>
        </div>

        <p style="color: #4b5563; font-size: 14px; margin-bottom: 30px;">
            This code will expire in 15 minutes. If you did not request this, please ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            &copy; {{ date('Y') }} SHOP VIOTOR. All rights reserved.
        </p>
    </div>
</body>
</html>
