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
        ], 202);
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

    public function submitStudentVerification(Request $request): JsonResponse
    {
        $request->validate([
            'student_id' => 'required|string|max:255|unique:users,student_id,' . $request->user()->id,
        ]);

        $user = $request->user();
        $user->update([
            'student_id'                   => $request->student_id,
            'student_verification_status'  => 'pending',
        ]);

        return response()->json([
            'message' => 'Student ID submitted successfully and is pending approval.',
            'user'    => new UserResource($user),
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
}
