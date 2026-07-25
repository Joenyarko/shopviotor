<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Admin      = 'admin';
    case Staff      = 'staff';
    case Vendor     = 'vendor';
    case Customer   = 'customer';
    case Student    = 'student';

    public function label(): string
    {
        return match($this) {
            self::SuperAdmin => 'Super Admin',
            self::Admin      => 'Admin',
            self::Staff      => 'Staff',
            self::Vendor     => 'Vendor',
            self::Customer   => 'Customer',
            self::Student    => 'Student',
        };
    }

    public function isAdmin(): bool
    {
        return in_array($this, [self::SuperAdmin, self::Admin, self::Staff]);
    }
}
