<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Payment Receipt</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; color: #1a1a1a; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: #1a1a1a; padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; color: #f5c000; font-weight: 900; }
        .header p { margin: 8px 0 0; color: #aaa; font-size: 14px; }
        .body { padding: 32px; }
        .receipt-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        .receipt-row:last-child { border-bottom: none; }
        .label { color: #666; }
        .value { font-weight: 600; }
        .amount { font-size: 28px; font-weight: 900; color: #1a1a1a; text-align: center; margin: 24px 0; }
        .amount span { color: #f5c000; }
        .footer { background: #f5f5f5; color: #888; text-align: center; padding: 20px; font-size: 12px; }
        .footer a { color: #f5c000; text-decoration: none; }
        .success-badge { background: #dcfce7; color: #166534; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; display: inline-block; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🛍️ Shop Viotor</h1>
        <p>Payment Receipt</p>
    </div>
    <div class="body">
        <p>Hi <strong>{{ $payment->user->first_name ?? 'Customer' }}</strong>,</p>
        <p>Your payment has been received and confirmed. Here's your receipt:</p>

        <div class="amount">
            <span>GHS</span> {{ number_format($payment->amount, 2) }}
        </div>

        <div class="receipt-row"><span class="label">Reference</span><span class="value">{{ $payment->reference }}</span></div>
        <div class="receipt-row"><span class="label">Method</span><span class="value">{{ ucfirst($payment->method->value ?? $payment->method) }}</span></div>
        <div class="receipt-row"><span class="label">Status</span><span class="value"><span class="success-badge">✓ Confirmed</span></span></div>
        <div class="receipt-row"><span class="label">Date</span><span class="value">{{ $payment->paid_at?->format('d M Y, h:i A') ?? now()->format('d M Y, h:i A') }}</span></div>

        <p style="margin-top:24px; font-size:13px; color:#666;">Keep this receipt for your records. If you have any concerns, contact us through the app.</p>
    </div>
    <div class="footer">
        <p>© {{ date('Y') }} Shop Viotor — The ATU Student Marketplace</p>
        <p><a href="{{ config('app.frontend_url', 'http://localhost:5173') }}">Visit Shop Viotor</a></p>
    </div>
</div>
</body>
</html>
