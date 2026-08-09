<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RaffleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->uuid,
            'title'             => $this->title,
            'description'       => $this->description,
            'prize_description' => $this->prize_description,
            'prize_value'       => $this->prize_value,
            'ticket_price'      => $this->ticket_price,
            'max_tickets'       => $this->max_tickets,
            'tickets_sold'      => $this->tickets_sold,
            'available_tickets' => $this->available_tickets,
            'status'            => $this->status->value,
            'status_label'      => $this->status->label(),
            'image'             => $this->image_url,
            'starts_at'         => $this->starts_at,
            'ends_at'           => $this->ends_at,
            'drawn_at'          => $this->drawn_at,
            'winner'            => $this->when($this->status->value === 'completed', function () {
                $winningTicket = \App\Models\RaffleTicket::where('raffle_id', $this->id)->where('is_winner', true)->with('user')->first();
                if ($winningTicket) {
                    return [
                        'user_name' => $winningTicket->user->name ?? 'Anonymous',
                        'ticket_number' => $winningTicket->ticket_number,
                    ];
                }
                return null;
            }),
            'product'           => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
