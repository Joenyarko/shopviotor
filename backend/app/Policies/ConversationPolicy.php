<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        return $user->isAdmin() || $user->id === $conversation->customer_id;
    }

    public function sendMessage(User $user, Conversation $conversation): bool
    {
        return $user->isAdmin() || $user->id === $conversation->customer_id;
    }
}
