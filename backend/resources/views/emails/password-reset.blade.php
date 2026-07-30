@extends('emails.layout')
@section('title', 'Reset Password')
@section('content')
    <h1>Reset Your Password</h1>
    <p>Hi <strong>{{ $user->first_name }}</strong>,</p>
    <p>You are receiving this email because we received a password reset request for your account.</p>
    <a href="{{ $url }}" class="btn">Reset Password</a>
    <p>This password reset link will expire in 60 minutes.</p>
    <p>If you did not request a password reset, no further action is required.</p>
@endsection