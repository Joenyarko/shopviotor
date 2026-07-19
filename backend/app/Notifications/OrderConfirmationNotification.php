<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Order $order) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Order Confirmed – #{$this->order->order_number}")
            ->greeting("Hello {$notifiable->first_name}!")
            ->line("Your order **#{$this->order->order_number}** has been confirmed.")
            ->line("**Total:** GHS " . number_format($this->order->total, 2))
            ->action('View Order', config('app.url') . "/orders/{$this->order->uuid}")
            ->line('Thank you for shopping with Viotor!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'order_confirmation',
            'title'        => 'Order Confirmed',
            'message'      => "Your order #{$this->order->order_number} has been confirmed.",
            'order_id'     => $this->order->id,
            'order_uuid'   => $this->order->uuid,
            'order_number' => $this->order->order_number,
            'total'        => $this->order->total,
        ];
    }
}
