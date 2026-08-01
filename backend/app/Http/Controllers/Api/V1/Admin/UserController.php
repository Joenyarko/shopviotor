<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(private UserRepository $userRepo) {}

    public function index(Request $request): JsonResponse
    {
        $role = $request->input('role');

        if ($role === 'admin') {
            $users = $this->userRepo->getAdmins($request->input('per_page', 100));
        } elseif ($role === 'customer') {
            $users = $this->userRepo->getCustomers($request->input('per_page', 100));
        } else {
            $users = \App\Models\User::latest()->paginate($request->input('per_page', 100));
        }

        return response()->json([
            'data' => UserResource::collection($users)->response()->getData(true),
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $user = $this->userRepo->findByUuid($uuid, ['addresses']);

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    public function toggleStatus(string $uuid): JsonResponse
    {
        $user = $this->userRepo->findByUuid($uuid);

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message' => 'User status updated successfully.',
            'is_active' => $user->is_active,
        ]);
    }

    public function updateRole(string $uuid, Request $request): JsonResponse
    {
        $request->validate([
            'role' => ['required', 'in:customer,admin,vendor'],
        ]);

        $user = $this->userRepo->findByUuid($uuid);
        $user->update(['role' => $request->role]);

        return response()->json([
            'message' => 'User role updated successfully.',
            'data' => new UserResource($user),
        ]);
    }

    public function sendAdminOtp(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $code = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        \Illuminate\Support\Facades\Cache::put('admin_otp_' . $user->id, $code, now()->addMinutes(10));
        \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\TwoFactorAuthMail($user, $code));

        return response()->json(['message' => 'Verification code sent to your email.']);
    }

    public function verifyAdminOtp(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cachedCode = \Illuminate\Support\Facades\Cache::get('admin_otp_' . $user->id);

        if (!$cachedCode || $cachedCode !== $request->code) {
            return response()->json(['message' => 'The verification code is invalid or has expired.'], 422);
        }

        \Illuminate\Support\Facades\Cache::forget('admin_otp_' . $user->id);

        return response()->json([
            'message' => 'Admin portal access verified.',
            'verified' => true
        ]);
    }

    public function destroy(string $uuid): JsonResponse
    {
        $user = $this->userRepo->findByUuid($uuid);

        if (auth()->id() === $user->id) {
            return response()->json([
                'message' => 'You cannot delete yourself.'
            ], 403);
        }

        $user->forceDelete(); // Permanently delete to prevent unique constraint errors

        return response()->json([
            'message' => 'User deleted successfully.'
        ]);
    }

    public function pendingStudentVerifications(Request $request): JsonResponse
    {
        $users = \App\Models\User::where('student_verification_status', 'pending')
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => UserResource::collection($users)->response()->getData(true),
        ]);
    }

    public function approveStudentVerification(string $uuid, Request $request): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:approved,rejected'],
        ]);

        $user = $this->userRepo->findByUuid($uuid);
        $user->update(['student_verification_status' => $request->status]);

        return response()->json([
            'message' => 'Student verification status updated successfully.',
            'data' => new UserResource($user),
        ]);
    }
}
