@extends('emails.layout')
@section('title', 'Payment Receipt')
@section('content')
    <h1>Payment Receipt</h1>
    <p>Hi <strong>{{ $payment->user->first_name ?? 'Customer' }}</strong>,</p>
    <p>Your payment has been successfully received and confirmed. Here is your receipt:</p>
    
    <div class="highlight-box">
        <span class="code">GHS {{ number_format($payment->amount, 2) }}</span>
    </div>
    
    <table class="table">
        <tbody>
            <tr>
                <td><strong>Reference</strong></td>
                <td>{{ $payment->reference }}</td>
            </tr>
            <tr>
                <td><strong>Payment Method</strong></td>
                <td>{{ ucfirst($payment->method->value ?? $payment->method) }}</td>
            </tr>
            <tr>
                <td><strong>Status</strong></td>
                <td style="color:#dcfce7;">Confirmed</td>
            </tr>
            <tr>
                <td><strong>Date</strong></td>
                <td>{{ $payment->paid_at?->format('d M Y, h:i A') ?? now()->format('d M Y, h:i A') }}</td>
            </tr>
        </tbody>
    </table>
    
    <p>Keep this receipt for your records. If you have any concerns, you can track this payment in your dashboard.</p>
    <a href="{{ config('app.frontend_url') }}/dashboard" class="btn">View Dashboard</a>
@endsection
