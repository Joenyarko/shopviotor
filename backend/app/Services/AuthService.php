<?php

namespace App\Services;

use App\Models\User;
use App\Models\LoginLog;
use App\Enums\UserRole;
use App\Repositories\UserRepository;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(private UserRepository $userRepo) {}

    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $user = $this->userRepo->create([
                'first_name' => $data['first_name'],
                'last_name'  => $data['last_name'],
                'email'      => $data['email'],
                'phone'      => $data['phone'] ?? null,
                'password'   => $data['password'],
                'role'       => UserRole::Customer->value,
            ]);

            $user->assignRole(UserRole::Customer->value);

            event(new Registered($user));

            $token = $user->createToken('auth_token', ['customer'])->plainTextToken;

            return ['user' => $user, 'token' => $token];
        });
    }

    public function login(array $data, string $ip = null, string $userAgent = null): array
    {
        $user = $this->userRepo->findByEmail($data['email']);

        if (!$user || !Hash::check($data['password'], $user->password)) {
            $this->logLoginAttempt($user, $ip, $userAgent, 'failed');
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        if (!$user->is_active) {
            $this->logLoginAttempt($user, $ip, $userAgent, 'blocked');
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended. Contact support.'],
            ]);
        }

        // Generate 2FA Code
        $code = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store in cache for 10 minutes
        \Illuminate\Support\Facades\Cache::put('2fa_code_' . $user->id, $code, now()->addMinutes(10));
        
        // Send email
        \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\TwoFactorAuthMail($user, $code));
        
        $this->logLoginAttempt($user, $ip, $userAgent, 'successful');

        return [
            'requires_2fa' => true,
            'user_id'      => $user->id,
            'message'      => 'A verification code has been sent to your email.'
        ];
    }

    public function verify2Fa(int $userId, string $code, string $ip = null, string $userAgent = null): array
    {
        $cachedCode = \Illuminate\Support\Facades\Cache::get('2fa_code_' . $userId);

        if (!$cachedCode || $cachedCode !== $code) {
            throw ValidationException::withMessages([
                'code' => ['The verification code is invalid or has expired.'],
            ]);
        }

        \Illuminate\Support\Facades\Cache::forget('2fa_code_' . $userId);

        $user = $this->userRepo->findById($userId);

        $abilities  = $user->isAdmin() ? ['admin', 'customer'] : ['customer'];
        $token      = $user->createToken('auth_token', $abilities)->plainTextToken;

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ]);

        return ['user' => $user, 'token' => $token];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function logoutAll(User $user): void
    {
        $user->tokens()->delete();
    }

    public function sendPasswordReset(string $email): string
    {
        $status = Password::sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return $status;
    }

    public function resetPassword(array $data): void
    {
        $status = Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }
    }

    private function logLoginAttempt(?User $user, ?string $ip, ?string $userAgent, string $status): void
    {
        if (!$user) return;

        LoginLog::create([
            'user_id'    => $user->id,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'status'     => $status,
        ]);
    }
}
