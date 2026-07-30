@extends('emails.layout')
@section('title', 'Store Approved!')
@section('content')
    <h1>Congratulations! 🎉</h1>
    <p>Hi <strong>{{ $user->first_name }}</strong>,</p>
    <p>Your application to become a Vendor on Shop Viotor has been <strong>approved</strong>!</p>
    <p>You can now log in to your dashboard to set up your store, manage inventory, and start selling to the ATU community.</p>
    <a href="{{ config('app.frontend_url') }}/dashboard" class="btn">Go to Dashboard</a>
@endsection