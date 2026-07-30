<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class VendorApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    

    public function __construct(public \App\Models\User $user)
    {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('support@shopviotor.com', 'Shop Viotor Support'),
            subject: 'Store Approved! 🎉',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.vendor-approved'
        );
    }

    public function attachments(): array
    {
        return [];
    }
}