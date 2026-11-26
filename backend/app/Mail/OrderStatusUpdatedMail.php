<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $statusLabel;

    public function __construct(
        public Order $order,
        public string $newStatus,
        public ?string $note = null
    ) {
        $this->statusLabel = match ($newStatus) {
            'processing' => 'Processing',
            'confirmed'  => 'Confirmed',
            'shipped'    => 'Shipped',
            'delivered'  => 'Delivered',
            'cancelled'  => 'Cancelled',
            default      => ucfirst($newStatus),
        };
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('orders@shopviotor.com', 'Shop Viotor Orders'),
            subject: "Order #{$this->order->order_number} is now {$this->statusLabel} — Shop Viotor",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-status-updated',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
