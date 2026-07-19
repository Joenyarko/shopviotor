<?php

namespace App\Notifications;

use App\Models\Raffle;
use App\Models\RaffleWinner;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RaffleWinnerNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Raffle $raffle,
        public readonly RaffleWinner $winner,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("🎉 Congratulations! You Won the {$this->raffle->title} Raffle!")
            ->greeting("Congratulations {$notifiable->first_name}!")
            ->line("You have won the **{$this->raffle->title}** raffle!")
            ->line("**Prize:** {$this->raffle->prize_description}")
            ->line("**Your Winning Ticket:** {$this->winner->ticket->ticket_number}")
            ->line("**Verification Code:** {$this->winner->verification_code}")
            ->action('Claim Your Prize', config('app.url') . "/raffles/{$this->raffle->uuid}/claim")
            ->line('Please contact us to arrange prize collection.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'      => 'raffle_winner',
            'title'     => '🎉 You Won!',
            'message'   => "You won the {$this->raffle->title} raffle! Prize: {$this->raffle->prize_description}",
            'raffle_id' => $this->raffle->id,
            'prize'     => $this->raffle->prize_description,
            'code'      => $this->winner->verification_code,
        ];
    }
}
