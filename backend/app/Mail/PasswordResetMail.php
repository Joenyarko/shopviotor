<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $resetUrl;
    public $user;

    public function __construct($user, string $token)
    {
        $this->user = $user;
        $frontendUrl = config('app.frontend_url', 'https://shopviotor.com');
        $this->resetUrl = "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($user->email);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('support@shopviotor.com', 'Shop Viotor Support'),
            subject: 'Reset Your Password | Shop Viotor',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.password-reset',
            with: [
                'url' => $this->resetUrl,
                'user' => $this->user,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}