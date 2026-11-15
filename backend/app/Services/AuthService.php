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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Mail\RegistrationOtpMail;

class AuthService
{
    public function __construct(private UserRepository $userRepo) {}

    public function register(array $data): array
    {
        // Generate a 6-digit OTP
        $otp = (string) random_int(100000, 999999);

        // Store registration data and OTP in cache for 15 minutes
        Cache::put('registration_otp_' . $data['email'], [
            'data' => $data,
            'otp'  => $otp,
        ], now()->addMinutes(15));

        // Send OTP email
        Mail::to($data['email'])->send(new RegistrationOtpMail($otp));

        return [
            'requires_verification' => true,
            'email' => $data['email'],
            'message' => 'Please check your email for the verification code.'
        ];
    }

    public function verifyRegistration(string $email, string $otp): array
    {
        $attemptKey = 'registration_otp_attempts_' . $email;
        $attempts   = Cache::get($attemptKey, 0);

        if ($attempts >= 5) {
            Cache::forget('registration_otp_' . $email);
            throw ValidationException::withMessages([
                'otp' => ['Too many failed attempts. Please register again to request a new code.'],
            ]);
        }

        $cacheKey = 'registration_otp_' . $email;
        $cachedData = Cache::get($cacheKey);

        if (!$cachedData || !hash_equals((string) $cachedData['otp'], (string) $otp)) {
            Cache::put($attemptKey, $attempts + 1, now()->addMinutes(15));
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired verification code.'],
            ]);
        }

        Cache::forget($attemptKey);

        $data = $cachedData['data'];

        return DB::transaction(function () use ($data, $cacheKey) {
            $user = User::withTrashed()->where('email', $data['email'])->first();

            if ($user) {
                if ($user->trashed()) {
                    $user->restore();
                }
                $user->update([
                    'first_name'  => $data['first_name'],
                    'last_name'   => $data['last_name'],
                    'phone'       => $data['phone'] ?? null,
                    'password'    => $data['password'],
                    'is_active'   => true,
                    'is_verified' => true,
                ]);
            } else {
                $user = $this->userRepo->create([
                    'first_name'  => $data['first_name'],
                    'last_name'   => $data['last_name'],
                    'email'       => $data['email'],
                    'phone'       => $data['phone'] ?? null,
                    'password'    => $data['password'],
                    'role'        => UserRole::Customer->value,
                    'is_active'   => true,
                    'is_verified' => true, // verified by email
                ]);
            }

            // Removed $user->assignRole() to fix Spatie missing role guard error
            // The enum role property is already enough for our checks

            $token = $user->createToken('auth_token', ['customer'])->plainTextToken;

            // Clear the cache
            Cache::forget($cacheKey);

            return ['user' => $user, 'token' => $token];
        });
    }

    public function login(array $data, string $ip = null, string $userAgent = null): array
    {
        $email = strtolower(trim($data['email']));
        $emailHash = md5($email);
        $lockoutKey = 'login_lockout_until_' . $emailHash;
        $attemptsKey = 'login_failed_attempts_' . $emailHash;
        $tierKey = 'login_lockout_tier_' . $emailHash;

        // 1. Check if account is temporarily locked out
        $lockoutUntil = Cache::get($lockoutKey);
        if ($lockoutUntil && now()->timestamp < $lockoutUntil) {
            $remainingSeconds = $lockoutUntil - now()->timestamp;
            $remainingMinutes = max(1, (int) ceil($remainingSeconds / 60));
            throw ValidationException::withMessages([
                'email' => ["Account temporarily locked due to multiple failed login attempts. Please try again in {$remainingMinutes} minute(s)."],
            ]);
        }

        // 2. IP-based rate limiting guard against brute-force / credential stuffing
        if ($ip) {
            $ipLockoutKey = 'login_ip_lockout_until_' . md5($ip);
            $ipLockoutUntil = Cache::get($ipLockoutKey);
            if ($ipLockoutUntil && now()->timestamp < $ipLockoutUntil) {
                $remSec = $ipLockoutUntil - now()->timestamp;
                $remMin = max(1, (int) ceil($remSec / 60));
                throw ValidationException::withMessages([
                    'email' => ["Too many failed login requests from your network. Please wait {$remMin} minute(s) before trying again."],
                ]);
            }
        }

        $user = $this->userRepo->findByEmail($email);

        // 3. Credential verification
        if (!$user || !Hash::check($data['password'], $user->password)) {
            $this->logLoginAttempt($user, $ip, $userAgent, 'failed');

            // Increment failed attempt counter
            $attempts = (int) Cache::get($attemptsKey, 0) + 1;
            Cache::put($attemptsKey, $attempts, now()->addHours(24));

            // IP attempt tracking
            if ($ip) {
                $ipAttemptsKey = 'login_ip_attempts_' . md5($ip);
                $ipAttempts = (int) Cache::get($ipAttemptsKey, 0) + 1;
                Cache::put($ipAttemptsKey, $ipAttempts, now()->addHours(24));
                if ($ipAttempts >= 10) {
                    Cache::put('login_ip_lockout_until_' . md5($ip), now()->addMinutes(15)->timestamp, now()->addMinutes(15));
                }
            }

            // Lockout triggered at 3 failed attempts
            if ($attempts >= 3) {
                $tier = (int) Cache::get($tierKey, 0) + 1;
                Cache::put($tierKey, $tier, now()->addDays(7));

                // Progressive lockout duration:
                // Tier 1: 15 minutes
                // Tier 2: 60 minutes (1 hour)
                // Tier 3+: 240 minutes (4 hours)
                $lockoutMinutes = match ($tier) {
                    1 => 15,
                    2 => 60,
                    default => 240,
                };

                $lockoutTimestamp = now()->addMinutes($lockoutMinutes)->timestamp;
                Cache::put($lockoutKey, $lockoutTimestamp, now()->addMinutes($lockoutMinutes));
                Cache::forget($attemptsKey);

                $lockoutLabel = $lockoutMinutes >= 60 
                    ? ($lockoutMinutes / 60) . ' hour(s)' 
                    : "{$lockoutMinutes} minutes";

                throw ValidationException::withMessages([
                    'email' => ["Account temporarily locked due to 3 failed attempts. Please try again in {$lockoutLabel}."],
                ]);
            }

            $remaining = 3 - $attempts;
            throw ValidationException::withMessages([
                'email' => ["These credentials do not match our records. ({$remaining} attempt" . ($remaining === 1 ? '' : 's') . " remaining before account lockout)"],
            ]);
        }

        if (!$user->is_active) {
            $this->logLoginAttempt($user, $ip, $userAgent, 'blocked');
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended or deactivated. Contact support@shopviotor.com.'],
            ]);
        }

        // Reset lockout tracking on successful password entry
        Cache::forget($attemptsKey);
        Cache::forget($lockoutKey);
        Cache::forget($tierKey);
        if ($ip) {
            Cache::forget('login_ip_attempts_' . md5($ip));
        }

        // Generate 2FA Code
        $code = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store in cache for 10 minutes
        Cache::put('2fa_code_' . $user->id, $code, now()->addMinutes(10));
        
        // Send email
        Mail::to($user->email)->send(new \App\Mail\TwoFactorAuthMail($user, $code));
        
        $this->logLoginAttempt($user, $ip, $userAgent, 'successful');

        return [
            'requires_2fa' => true,
            'user_id'      => $user->id,
            'message'      => 'A verification code has been sent to your email.'
        ];
    }

    public function verify2Fa(int $userId, string $code, string $ip = null, string $userAgent = null): array
    {
        $attemptKey  = '2fa_attempts_' . $userId;
        $lockoutKey  = '2fa_lockout_until_' . $userId;
        $tierKey     = '2fa_tier_' . $userId;

        // Check if 2FA is locked
        $lockoutUntil = Cache::get($lockoutKey);
        if ($lockoutUntil && now()->timestamp < $lockoutUntil) {
            $remMin = max(1, (int) ceil(($lockoutUntil - now()->timestamp) / 60));
            throw ValidationException::withMessages([
                'code' => ["Too many failed verification attempts. Please wait {$remMin} minute(s) before trying again."],
            ]);
        }

        $attempts = (int) Cache::get($attemptKey, 0);
        $cachedCode = Cache::get('2fa_code_' . $userId);

        if (!$cachedCode || !hash_equals((string) $cachedCode, trim((string) $code))) {
            $attempts++;
            Cache::put($attemptKey, $attempts, now()->addMinutes(15));

            if ($attempts >= 3) {
                $tier = (int) Cache::get($tierKey, 0) + 1;
                Cache::put($tierKey, $tier, now()->addDays(7));
                $lockMinutes = match ($tier) {
                    1 => 15,
                    2 => 60,
                    default => 240,
                };

                Cache::put($lockoutKey, now()->addMinutes($lockMinutes)->timestamp, now()->addMinutes($lockMinutes));
                Cache::forget('2fa_code_' . $userId);
                Cache::forget($attemptKey);

                throw ValidationException::withMessages([
                    'code' => ["Too many failed attempts. Verification locked for {$lockMinutes} minutes. Please log in again."],
                ]);
            }

            $rem = 3 - $attempts;
            throw ValidationException::withMessages([
                'code' => ["The verification code is invalid or has expired. ({$rem} attempt" . ($rem === 1 ? '' : 's') . " remaining)"],
            ]);
        }

        // Success: clean up attempt counter, code, and lockout tier
        Cache::forget('2fa_code_' . $userId);
        Cache::forget($attemptKey);
        Cache::forget($lockoutKey);
        Cache::forget($tierKey);

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
