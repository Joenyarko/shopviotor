<?php

namespace Database\Seeders;

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::updateOrCreate(
            ['email' => 'admin@vte.com'],
            [
                'uuid'        => Str::uuid()->toString(),
                'first_name'  => 'Admin',
                'last_name'   => 'Viotor',
                'password'    => 'password', // hashed casting
                'role'        => UserRole::Admin,
                'is_active'   => true,
                'is_verified' => true,
            ]
        );

        // Create Customer User
        User::updateOrCreate(
            ['email' => 'customer@vte.com'],
            [
                'uuid'        => Str::uuid()->toString(),
                'first_name'  => 'Customer',
                'last_name'   => 'Viotor',
                'password'    => 'password', // hashed casting
                'role'        => UserRole::Customer,
                'is_active'   => true,
                'is_verified' => true,
            ]
        );
    }
}
