<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(?User $user): bool
    {
        return true; // Public browsing
    }

    public function view(?User $user, Product $product): bool
    {
        return $product->status->isPubliclyVisible()
            || ($user && ($user->isAdmin() || $user->id === $product->user_id));
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Product $product): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->isSuperAdmin() || $user->hasRole('admin');
    }
}
