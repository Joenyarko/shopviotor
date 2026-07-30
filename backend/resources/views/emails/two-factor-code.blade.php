@extends('emails.layout')
@section('title', 'Your Login Code')
@section('content')
    <h1>Authentication Code</h1>
    <p>Hi <strong>{{ $user->first_name }}</strong>,</p>
    <p>We received a request to log in to your Shop Viotor account. Please use the verification code below to complete your sign-in.</p>
    <div class="highlight-box">
        <span class="code">{{ $code }}</span>
    </div>
    <p><em>This code will expire in 10 minutes. If you did not request this, please ignore this email.</em></p>
@endsection