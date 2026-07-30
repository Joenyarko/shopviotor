<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmed</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; color: #1a1a1a; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: #f5c000; padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; color: #1a1a1a; font-weight: 900; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; color: #333; font-size: 14px; }
        .body { padding: 32px; }
        .order-box { background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-number { font-size: 20px; font-weight: 800; color: #f5c000; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { background: #f5c000; color: #1a1a1a; padding: 10px 12px; text-align: left; font-size: 13px; }
        td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        .total-row td { font-weight: 700; font-size: 15px; border-top: 2px solid #f5c000; border-bottom: none; }
        .footer { background: #1a1a1a; color: #888; text-align: center; padding: 20px; font-size: 12px; }
        .footer a { color: #f5c000; text-decoration: none; }
        .badge { display: inline-block; background: #f5c000; color: #1a1a1a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🛍️ Shop Viotor</h1>
        <p>Your Order is Confirmed!</p>
    </div>
    <div class="body">
        <p>Hi <strong>{{ $order->user->first_name }}</strong>,</p>
        <p>Thank you for shopping with <strong>Shop Viotor</strong>! Your order has been received and is being processed.</p>

        <div class="order-box">
            <div style="margin-bottom:8px; font-size:13px; color:#666; text-transform:uppercase; letter-spacing:1px;">Order Number</div>
            <div class="order-number">{{ $order->order_number }}</div>
            <div style="margin-top:8px;"><span class="badge">{{ ucfirst($order->status->value ?? $order->status) }}</span></div>
        </div>

        <h3 style="font-size:15px; margin-bottom:8px;">Order Items</h3>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->product_name }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>GHS {{ number_format($item->total, 2) }}</td>
                </tr>
                @endforeach
                @if($order->discount_amount > 0)
                <tr><td colspan="2">Discount</td><td>- GHS {{ number_format($order->discount_amount, 2) }}</td></tr>
                @endif
                @if($order->shipping_amount > 0)
                <tr><td colspan="2">Shipping</td><td>GHS {{ number_format($order->shipping_amount, 2) }}</td></tr>
                @endif
                <tr class="total-row">
                    <td colspan="2">Total</td>
                    <td>GHS {{ number_format($order->total, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <p style="font-size:13px; color:#666;">We'll notify you once your order is shipped. If you have any questions, contact us through the app.</p>
    </div>
    <div class="footer">
        <p>© {{ date('Y') }} Shop Viotor — The ATU Student Marketplace</p>
        <p><a href="{{ config('app.frontend_url', 'http://localhost:5173') }}">Visit Shop Viotor</a></p>
    </div>
</div>
</body>
</html>
