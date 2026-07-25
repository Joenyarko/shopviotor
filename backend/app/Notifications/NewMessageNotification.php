<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification
{
    use Queueable;

    protected $context;
    protected $url;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $context, string $url)
    {
        $this->context = $context;
        $this->url = $url;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Message Regarding ' . $this->context)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('You have received a new message from the Shop Viotor team regarding your ' . $this->context . '.')
            ->action('View Message', $this->url)
            ->line('Log in to your dashboard to view the message and reply.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
