<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Support\Str;

class UserObserver
{
    public function creating(User $user): void
    {
        if (empty($user->uuid)) {
            $user->uuid = Str::uuid()->toString();
        }
    }

    public function updated(User $user): void
    {
        if ($user->wasChanged('is_active') && !$user->is_active) {
            // Revoke all tokens when account is suspended
            $user->tokens()->delete();
        }
    }
}
