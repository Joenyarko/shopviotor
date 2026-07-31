<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Traits\HasUuid;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasRoles, HasUuid;

    protected $fillable = [
        'uuid',
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'avatar',
        'date_of_birth',
        'gender',
        'role',
        'is_active',
        'is_verified',
        'two_factor_secret',
        'two_factor_enabled',
        'two_factor_recovery_codes',
        'last_login_at',
        'last_login_ip',
        'device_token',
        'student_id',
        'student_verification_status',
        'google_id',
        'google_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected $appends = [
        'name',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'    => 'datetime',
            'phone_verified_at'    => 'datetime',
            'last_login_at'        => 'datetime',
            'date_of_birth'        => 'date',
            'is_active'            => 'boolean',
            'is_verified'          => 'boolean',
            'two_factor_enabled'   => 'boolean',
            'two_factor_recovery_codes' => 'encrypted:array',
            'role'                 => UserRole::class,
            'password'             => 'hashed',
        ];
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCustomers($query)
    {
        return $query->where('role', UserRole::Customer->value);
    }

    public function scopeAdmins($query)
    {
        return $query->whereIn('role', [
            UserRole::SuperAdmin->value,
            UserRole::Admin->value,
            UserRole::Staff->value,
        ]);
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar) return null;
        return \Illuminate\Support\Str::startsWith($this->avatar, ['http://', 'https://']) 
            ? $this->avatar 
            : asset('storage/' . $this->avatar);
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function serviceProfile(): HasOne
    {
        return $this->hasOne(ServiceProfile::class);
    }

    public function defaultAddress(): HasOne
    {
        return $this->hasOne(Address::class)->where('is_default', true);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function wishlist(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'customer_id');
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function sellRequests(): HasMany
    {
        return $this->hasMany(SellRequest::class);
    }

    public function tradeRequests(): HasMany
    {
        return $this->hasMany(TradeRequest::class);
    }

    public function hirePurchases(): HasMany
    {
        return $this->hasMany(HirePurchase::class);
    }

    public function layaways(): HasMany
    {
        return $this->hasMany(Layaway::class);
    }

    public function layawayCards(): HasMany
    {
        return $this->hasMany(LayawayCard::class);
    }

    public function store(): HasOne
    {
        return $this->hasOne(Store::class);
    }

    public function raffleTickets(): HasMany
    {
        return $this->hasMany(RaffleTicket::class);
    }

    public function loginLogs(): HasMany
    {
        return $this->hasMany(LoginLog::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function isSuperAdmin(): bool
    {
        return $this->role === UserRole::SuperAdmin;
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, [UserRole::SuperAdmin, UserRole::Admin, UserRole::Staff]);
    }

    public function isCustomer(): bool
    {
        return $this->role === UserRole::Customer || $this->role === UserRole::Student;
    }

    public function isVendor(): bool
    {
        return $this->role === UserRole::Vendor;
    }

    public function getNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}
