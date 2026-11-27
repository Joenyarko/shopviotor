<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Mail\PasswordResetMail;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return response()->json($result, 202); // 202 Accepted because we need OTP
    }

    public function verifyRegistration(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        $result = $this->authService->verifyRegistration(
            $request->input('email'),
            $request->input('otp')
        );

        return response()->json([
            'message' => 'Registration successful.',
            'user'    => new UserResource($result['user']),
            'token'   => $result['token'],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->validated(),
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'message'      => $result['message'],
            'requires_2fa' => $result['requires_2fa'],
            'user_id'      => $result['user_id'],
        ], 200);
    }

    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            $user = User::withTrashed()->where('email', $googleUser->getEmail())->first();

            if ($user) {
                if ($user->trashed()) {
                    $user->restore(); // Restore soft-deleted account
                }

                // Update existing user with Google ID
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'google_token' => $googleUser->token,
                ]);
            } else {
                // Create new user
                $user = User::create([
                    'first_name' => $googleUser->user['given_name'] ?? $googleUser->getName(),
                    'last_name' => $googleUser->user['family_name'] ?? '',
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'google_token' => $googleUser->token,
                    'role' => \App\Enums\UserRole::Customer->value,
                    'is_active' => true,
                    'is_verified' => true,
                ]);
            }

            // Generate token
            $abilities = $user->isAdmin() ? ['admin', 'customer'] : ['customer'];
            $token = $user->createToken('auth_token', $abilities)->plainTextToken;

            // SECURITY: Store token behind a short-lived one-time exchange code (60s TTL)
            // so the bearer token is never exposed in URL query strings, browser history, or Referer headers
            $exchangeCode = Str::random(64);
            \Illuminate\Support\Facades\Cache::put('google_oauth_code_' . $exchangeCode, $token, now()->addSeconds(60));

            $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'https://www.shopviotor.com')), '/');
            return redirect($frontendUrl . '/auth/callback?code=' . urlencode($exchangeCode));

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Google OAuth callback failed', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to authenticate with Google. Please try again.',
            ], 500);
        }
    }

    public function exchangeGoogleCode(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:64',
        ]);

        $cacheKey = 'google_oauth_code_' . $request->input('code');
        $token    = \Illuminate\Support\Facades\Cache::pull($cacheKey); // atomic get-and-delete (one-time use)

        if (!$token) {
            return response()->json([
                'message' => 'Invalid or expired authentication code.',
            ], 422);
        }

        return response()->json([
            'token' => $token,
        ]);
    }


    public function verify2Fa(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|integer',
            'code'    => 'required|string|size:6',
        ]);

        $result = $this->authService->verify2Fa(
            $request->input('user_id'),
            $request->input('code'),
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'message' => 'Login successful.',
            'user'    => new UserResource($result['user']),
            'token'   => $result['token'],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('addresses')),
        ]);
    }

    private function storeKycFile($file, string $folder): string
    {
        try {
            if (method_exists($file, 'storeOnCloudinary')) {
                return $file->storeOnCloudinary($folder)->getSecurePath();
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Cloudinary KYC upload fallback to local disk: ' . $e->getMessage());
        }

        $path = $file->store($folder, 'public');
        return rtrim((string) config('app.url'), '/') . '/storage/' . ltrim($path, '/');
    }

    public function submitStudentVerification(Request $request): JsonResponse
    {
        $user = $request->user();
        if (($user->verification_attempts ?? 0) >= 3 && $user->student_verification_status === 'rejected') {
            return response()->json([
                'message' => 'You have reached the maximum number of re-application attempts (3). Please contact Shop Viotor support.',
            ], 422);
        }

        $request->validate([
            'student_id' => 'required|string|max:255|unique:users,student_id,' . $user->id,
            'student_name' => 'required|string|max:255',
            'student_course' => 'required|string|max:255',
            'student_level' => 'required|string|max:255',
            'student_id_picture' => 'required|image|max:10240',
        ]);

        $imageUrl = $this->storeKycFile($request->file('student_id_picture'), 'identity/student-ids');

        $updateData = [
            'applicant_type'               => 'student',
            'student_id'                   => $request->student_id,
            'student_name'                 => $request->student_name,
            'student_course'               => $request->student_course,
            'student_level'                => $request->student_level,
            'student_id_picture_url'       => $imageUrl,
            'student_verification_status'  => 'pending',
        ];
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'verification_rejection_reason')) {
            $updateData['verification_rejection_reason'] = null;
        }
        $user->update($updateData);

        return response()->json([
            'message' => 'Student ID submitted successfully and is pending admin approval.',
            'user'    => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Submit Ghana Card Identity Verification with Dojah Integration.
     */
    public function submitIdentityVerification(
        Request $request,
        \App\Services\Verification\DojahVerificationService $dojahService
    ): JsonResponse {
        $user = $request->user();
        if (($user->verification_attempts ?? 0) >= 3 && $user->identity_verification_status === 'rejected') {
            return response()->json([
                'message' => 'You have reached the maximum number of re-application attempts (3). Please contact Shop Viotor support.',
            ], 422);
        }

        $request->validate([
            'ghana_card_number'   => ['required', 'string', 'regex:/^GHA-\d{9}-\d$/i'],
            'digital_address'     => ['required', 'string', 'max:50'],
            'occupation'          => ['required', 'string', 'max:150'],
            'employer_name'       => ['nullable', 'string', 'max:150'],
            'monthly_income'      => ['nullable', 'numeric', 'min:0'],
            'next_of_kin_name'    => ['required', 'string', 'max:150'],
            'next_of_kin_phone'   => ['required', 'string', 'max:25'],
            'next_of_kin_relation'=> ['required', 'string', 'max:100'],
            'ghana_card_front'    => ['required', 'image', 'max:10240'],
            'ghana_card_back'     => ['nullable', 'image', 'max:10240'],
            'selfie_image'        => ['required'], // can be image file or base64 data url
        ]);

        // 1. Store Ghana Card Front & Back (Cloudinary preferred, full API URL fallback)
        $frontUrl = $this->storeKycFile($request->file('ghana_card_front'), 'identity/ghana-cards');
        $backUrl  = null;
        if ($request->hasFile('ghana_card_back')) {
            $backUrl = $this->storeKycFile($request->file('ghana_card_back'), 'identity/ghana-cards');
        }

        // 2. Process & Store Selfie (File or Base64 Webcam snapshot)
        $selfieUrl = null;
        if ($request->hasFile('selfie_image')) {
            $selfieUrl = $this->storeKycFile($request->file('selfie_image'), 'identity/selfies');
        } elseif (is_string($request->selfie_image) && str_starts_with($request->selfie_image, 'data:image')) {
            $imageParts = explode(';base64,', $request->selfie_image);
            if (isset($imageParts[1])) {
                $imageDecoded = base64_decode($imageParts[1]);
                $fileName = 'identity/selfies/' . uniqid('selfie_') . '.jpg';
                \Illuminate\Support\Facades\Storage::disk('public')->put($fileName, $imageDecoded);
                $selfieUrl = rtrim((string) config('app.url'), '/') . '/storage/' . $fileName;
            }
        }

        // 3. Perform Dojah verification (always queued for admin review unless explicitly auto-approved)
        $cardPin = strtoupper(trim($request->ghana_card_number));
        $dojahCardResult = $dojahService->verifyGhanaCard($cardPin);
        
        $dojahFaceResult = null;
        if ($selfieUrl) {
            $dojahFaceResult = $dojahService->verifyFacialMatch($selfieUrl);
        }

        $finalStatus = 'pending';

        $updateData = [
            'applicant_type'               => 'general',
            'ghana_card_number'            => $cardPin,
            'ghana_card_front_url'         => $frontUrl,
            'ghana_card_back_url'          => $backUrl,
            'selfie_url'                   => $selfieUrl,
            'digital_address'              => $request->digital_address,
            'occupation'                   => $request->occupation,
            'employer_name'                => $request->employer_name,
            'monthly_income'               => $request->monthly_income,
            'next_of_kin_name'             => $request->next_of_kin_name,
            'next_of_kin_phone'            => $request->next_of_kin_phone,
            'next_of_kin_relation'         => $request->next_of_kin_relation,
            'identity_verification_status' => $finalStatus,
            'dojah_reference'              => $dojahCardResult['reference'] ?? null,
            'dojah_raw_response'           => [
                'card_verification' => $dojahCardResult,
                'face_match'        => $dojahFaceResult,
                'submitted_at'      => now()->toIso8601String(),
            ],
        ];
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'verification_rejection_reason')) {
            $updateData['verification_rejection_reason'] = null;
        }
        $user->update($updateData);

        return response()->json([
            'message' => 'Identity application submitted successfully. Please wait for Admin approval before starting your payment plan.',
            'status'  => $finalStatus,
            'user'    => new UserResource($user->fresh()),
        ]);
    }

    // ─── Password Reset ───────────────────────────────────────────────────────

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Always return success to prevent email enumeration attacks
        if (!$user) {
            return response()->json([
                'message' => 'If this email exists in our system, you will receive a password reset link shortly.',
            ]);
        }

        // Generate a secure reset token
        $token = Str::random(64);

        // Store token in password_reset_tokens table
        DB::table('password_reset_tokens')->upsert([
            'email'      => $user->email,
            'token'      => Hash::make($token),
            'created_at' => now(),
        ], ['email']);

        // Send email (goes to log in testing mode, Brevo in production)
        try {
            Mail::to($user->email)->send(new PasswordResetMail($user, $token));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Password reset email failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'If this email exists in our system, you will receive a password reset link shortly.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'                 => 'required|email',
            'token'                 => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        // Find reset record
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'message' => 'Invalid or expired reset token.',
                'errors'  => ['token' => ['This password reset link is invalid or has expired.']],
            ], 422);
        }

        // Check token hasn't expired (1 hour limit)
        if (now()->diffInMinutes($resetRecord->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'This password reset link has expired. Please request a new one.',
                'errors'  => ['token' => ['Reset link expired.']],
            ], 422);
        }

        // Verify token hash
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'message' => 'Invalid or expired reset token.',
                'errors'  => ['token' => ['This password reset link is invalid.']],
            ], 422);
        }

        // Update password
        $user = User::where('email', $request->email)->firstOrFail();
        $user->update(['password' => $request->password]); // auto-hashed via cast

        // Delete used token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Revoke all existing tokens (force re-login)
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password reset successfully. Please log in with your new password.',
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password'      => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

        // Update password (auto-hashed by model cast)
        $user->update(['password' => $request->password]);

        // Revoke all tokens across all devices immediately
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password changed successfully. All other active sessions have been terminated. Please log in again.',
        ]);
    }

    public function refreshToken(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Delete current token
        if ($user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        // Issue new token with same abilities
        $abilities = $user->isAdmin() ? ['admin', 'customer'] : ['customer'];
        $newToken  = $user->createToken('auth_token', $abilities)->plainTextToken;

        return response()->json([
            'token'   => $newToken,
            'message' => 'Token refreshed successfully.',
        ]);
    }
}
