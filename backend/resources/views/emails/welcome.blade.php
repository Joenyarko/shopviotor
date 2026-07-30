@extends('emails.layout')
@section('title', 'Welcome to Shop Viotor')
@section('content')
    <h1>Welcome to Shop Viotor! 🚀</h1>
    <p>Hi <strong>{{ $user->first_name }}</strong>,</p>
    <p>We are thrilled to have you on board. Shop Viotor is the ultimate marketplace designed exclusively for the ATU community.</p>
    <div class="highlight-box">
        <p style="margin:0; font-size: 18px;">Buy, Sell, Trade, and Barter – all in one place!</p>
    </div>
    <p>Ready to discover amazing deals or start your own store? Dive right in.</p>
    <a href="{{ config('app.frontend_url') }}/products" class="btn">Start Shopping</a>
@endsection