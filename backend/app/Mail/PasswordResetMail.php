<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $resetUrl;

    public function __construct(public User $user, string $token)
    {
        // Frontend password reset URL — update FRONTEND_URL in .env to match your domain
        $frontendUrl    = config('app.frontend_url', 'http://localhost:5173');
        $this->resetUrl = "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($user->email);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset Your Password | Shop Viotor',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.password-reset');
    }

    public function attachments(): array
    {
        return [];
    }
}
