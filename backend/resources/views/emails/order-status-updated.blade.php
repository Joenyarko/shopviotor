<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Order Status Update — Shop Viotor</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
                    <tr>
                        <td style="background:#111827;padding:24px;text-align:center;">
                            <h1 style="margin:0;color:#f59e0b;font-size:22px;letter-spacing:0.5px;">SHOP VIOTOR VENTURES</h1>
                            <p style="margin:6px 0 0;color:#d4d4d8;font-size:13px;">Order Status Update</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 24px;">
                            <p style="margin:0 0 14px;font-size:15px;">
                                Hello <strong>{{ $order->user->first_name ?? 'Valued Customer' }}</strong>,
                            </p>
                            <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#3f3f46;">
                                Your order <strong>#{{ $order->order_number }}</strong> has been updated to:
                            </p>
                            <div style="text-align:center;margin:20px 0;">
                                <span style="display:inline-block;padding:10px 22px;border-radius:999px;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:0.6px;background:{{ $newStatus === 'delivered' ? '#dcfce7' : ($newStatus === 'cancelled' ? '#fee2e2' : '#fef3c7') }};color:{{ $newStatus === 'delivered' ? '#166534' : ($newStatus === 'cancelled' ? '#991b1b' : '#92400e') }};">
                                    {{ $statusLabel }}
                                </span>
                            </div>

                            @if(!empty($note))
                                <div style="background:#f4f4f5;border-left:4px solid #f59e0b;padding:12px 14px;border-radius:6px;margin:18px 0;font-size:13px;color:#27272a;">
                                    <strong>Note:</strong> {{ $note }}
                                </div>
                            @endif

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;border-top:1px solid #e4e4e7;border-bottom:1px solid #e4e4e7;padding:12px 0;font-size:13px;">
                                <tr>
                                    <td style="padding:4px 0;color:#71717a;">Order Number</td>
                                    <td align="right" style="padding:4px 0;font-weight:bold;">#{{ $order->order_number }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:4px 0;color:#71717a;">Order Total</td>
                                    <td align="right" style="padding:4px 0;font-weight:bold;">{{ $order->currency ?? 'GHS' }} {{ number_format((float) $order->total, 2) }}</td>
                                </tr>
                            </table>

                            <div style="text-align:center;margin:24px 0 8px;">
                                <a href="https://www.shopviotor.com/orders" style="display:inline-block;background:#f59e0b;color:#111827;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 26px;border-radius:8px;">
                                    Track Your Order
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#fafafa;padding:16px 24px;text-align:center;font-size:12px;color:#71717a;border-top:1px solid #e4e4e7;">
                            Questions? Reply to <a href="mailto:support@shopviotor.com" style="color:#d97706;">support@shopviotor.com</a> or call 0508208803.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
