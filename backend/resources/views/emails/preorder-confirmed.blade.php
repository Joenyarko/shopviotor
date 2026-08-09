@extends('emails.layout')
@section('title', 'Pre-Order Confirmed')
@section('content')
    <h1>Pre-Order Confirmed!</h1>
    <p>Hi <strong>{{ $preOrder->user->first_name ?? 'Customer' }}</strong>,</p>
    <p>Your pre-order has been confirmed. We'll notify you when the item is ready!</p>
    
    <table class="table">
        <tbody>
            <tr>
                <td><strong>Product</strong></td>
                <td>{{ $preOrder->product->name ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Total Price</strong></td>
                <td>GHS {{ number_format($preOrder->total_price, 2) }}</td>
            </tr>
            <tr>
                <td><strong>Deposit Paid</strong></td>
                <td>GHS {{ number_format($preOrder->deposit_paid, 2) }}</td>
            </tr>
            <tr>
                <td><strong>Balance Remaining</strong></td>
                <td>GHS {{ number_format($preOrder->balance_remaining, 2) }}</td>
            </tr>
            @if($preOrder->expected_date)
            <tr>
                <td><strong>Expected Date</strong></td>
                <td>{{ \Carbon\Carbon::parse($preOrder->expected_date)->format('d M Y') }}</td>
            </tr>
            @endif
            <tr>
                <td><strong>Status</strong></td>
                <td style="color:#f5c000;">{{ ucfirst($preOrder->status) }}</td>
            </tr>
        </tbody>
    </table>
    
    <p>Once your item is ready, you'll receive further instructions to complete the remaining balance.</p>
    <a href="{{ config('app.frontend_url') }}/dashboard" class="btn">View Dashboard</a>
@endsection
