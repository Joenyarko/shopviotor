<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class TwoFactorAuthMail extends Mailable
{
    use Queueable, SerializesModels;

    

    public function __construct(public \App\Models\User $user, public string $code)
    {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('support@shopviotor.com', 'Shop Viotor Security'),
            subject: 'Your Login Code',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.two-factor-code'
        );
    }

    public function attachments(): array
    {
        return [];
    }
}