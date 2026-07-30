<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Pre-Order Confirmed</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; color: #1a1a1a; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: #f5c000; padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; color: #1a1a1a; font-weight: 900; }
        .body { padding: 32px; }
        .info-box { background: #fafafa; border-left: 4px solid #f5c000; border-radius: 4px; padding: 16px 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
        .info-row:last-child { border-bottom: none; }
        .footer { background: #1a1a1a; color: #888; text-align: center; padding: 20px; font-size: 12px; }
        .footer a { color: #f5c000; text-decoration: none; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🛍️ Shop Viotor</h1>
        <p style="margin:8px 0 0; color:#333; font-size:14px;">Pre-Order Confirmed!</p>
    </div>
    <div class="body">
        <p>Hi <strong>{{ $preOrder->user->first_name ?? 'Customer' }}</strong>,</p>
        <p>Your pre-order has been confirmed. We'll notify you when the item is ready!</p>

        <div class="info-box">
            <div class="info-row"><span>Product</span><strong>{{ $preOrder->product->name ?? 'N/A' }}</strong></div>
            <div class="info-row"><span>Total Price</span><strong>GHS {{ number_format($preOrder->total_price, 2) }}</strong></div>
            <div class="info-row"><span>Deposit Paid</span><strong>GHS {{ number_format($preOrder->deposit_paid, 2) }}</strong></div>
            <div class="info-row"><span>Balance Remaining</span><strong>GHS {{ number_format($preOrder->balance_remaining, 2) }}</strong></div>
            @if($preOrder->expected_date)
            <div class="info-row"><span>Expected Date</span><strong>{{ \Carbon\Carbon::parse($preOrder->expected_date)->format('d M Y') }}</strong></div>
            @endif
            <div class="info-row"><span>Status</span><strong>{{ ucfirst($preOrder->status) }}</strong></div>
        </div>

        <p style="font-size:13px; color:#666;">Once your item is ready and delivered, you'll receive further instructions to complete the remaining balance.</p>
    </div>
    <div class="footer">
        <p>© {{ date('Y') }} Shop Viotor — The ATU Student Marketplace</p>
        <p><a href="{{ config('app.frontend_url', 'http://localhost:5173') }}">Visit Shop Viotor</a></p>
    </div>
</div>
</body>
</html>
