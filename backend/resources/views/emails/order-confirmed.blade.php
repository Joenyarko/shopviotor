@extends('emails.layout')
@section('title', 'Order Confirmed')
@section('content')
    <h1>Order Confirmed!</h1>
    <p>Hi <strong>{{ $order->user->first_name ?? 'Customer' }}</strong>,</p>
    <p>Great news! We have received your order <strong>#{{ $order->order_number }}</strong> and it is now being processed.</p>
    
    <table class="table">
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
            
            @if($order->shipping_amount > 0)
            <tr>
                <td colspan="2">Shipping</td>
                <td>GHS {{ number_format($order->shipping_amount, 2) }}</td>
            </tr>
            @endif
            
            @if($order->discount_amount > 0)
            <tr>
                <td colspan="2">Discount</td>
                <td style="color:#ff6b6b;">- GHS {{ number_format($order->discount_amount, 2) }}</td>
            </tr>
            @endif
            
            <tr class="total-row">
                <td colspan="2">Total Paid</td>
                <td>GHS {{ number_format($order->total, 2) }}</td>
            </tr>
        </tbody>
    </table>
    
    <p>You can track your order status in your dashboard.</p>
    <a href="{{ config('app.frontend_url') }}/dashboard" class="btn">View Dashboard</a>
@endsection