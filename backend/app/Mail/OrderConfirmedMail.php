<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class OrderConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    

    public function __construct(public \App\Models\Order $order)
    {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('orders@shopviotor.com', 'Shop Viotor Orders'),
            subject: 'Order Confirmed',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-confirmed'
        );
    }

    public function attachments(): array
    {
        return [];
    }
}