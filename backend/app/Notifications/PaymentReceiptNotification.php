<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentReceiptNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Payment $payment) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Payment Receipt – {$this->payment->reference}")
            ->greeting("Hello {$notifiable->first_name}!")
            ->line("We've received your payment of **GHS " . number_format($this->payment->amount, 2) . "**.")
            ->line("**Reference:** {$this->payment->reference}")
            ->line("**Method:** {$this->payment->method->label()}")
            ->action('View Payment', config('app.url') . "/payments/{$this->payment->uuid}")
            ->line('Thank you for your payment!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'       => 'payment_receipt',
            'title'      => 'Payment Received',
            'message'    => "Payment of GHS " . number_format($this->payment->amount, 2) . " confirmed.",
            'payment_id' => $this->payment->id,
            'reference'  => $this->payment->reference,
            'amount'     => $this->payment->amount,
        ];
    }
}
