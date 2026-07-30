<?php

namespace App\Mail;

use App\Models\PreOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PreOrderConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public PreOrder $preOrder) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pre-Order Confirmed | Shop Viotor',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.preorder-confirmed');
    }

    public function attachments(): array
    {
        return [];
    }
}
