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
        $search  = $request->input('search');
        $role    = $request->input('role');
        $perPage = (int) $request->input('per_page', 10);

        $query = \App\Models\User::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($role === 'admin') {
            $query->whereIn('role', [
                \App\Enums\UserRole::Admin->value,
                \App\Enums\UserRole::SuperAdmin->value,
                \App\Enums\UserRole::Staff->value,
            ]);
        } elseif ($role === 'customer') {
            $query->where('role', \App\Enums\UserRole::Customer->value);
        } elseif ($role === 'vendor') {
            $query->where('role', \App\Enums\UserRole::Vendor->value);
        }

        $users = $query->latest()->paginate($perPage);

        // Global counts for role filter tabs
        $counts = [
            'total'     => \App\Models\User::count(),
            'customers' => \App\Models\User::where('role', \App\Enums\UserRole::Customer->value)->count(),
            'vendors'   => \App\Models\User::where('role', \App\Enums\UserRole::Vendor->value)->count(),
            'admins'    => \App\Models\User::whereIn('role', [
                \App\Enums\UserRole::Admin->value,
                \App\Enums\UserRole::SuperAdmin->value,
                \App\Enums\UserRole::Staff->value,
            ])->count(),
        ];

        $paginatedData = UserResource::collection($users)->response()->getData(true);

        return response()->json([
            'data'   => $paginatedData['data'] ?? [],
            'meta'   => $paginatedData['meta'] ?? [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
            'counts' => $counts,
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
        if (auth()->id() === $user->id && $request->role !== 'admin') {
            return response()->json(['message' => 'You cannot demote yourself.'], 403);
        }

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
        // Mark 2FA as verified in cache for 12 hours
        \Illuminate\Support\Facades\Cache::put('admin_2fa_verified_' . $user->id, true, now()->addHours(12));

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

        // Preserve financial integrity: do not force delete users with payments, orders, or stores
        if ($user->orders()->exists() || $user->payments()->exists() || $user->store()->exists()) {
            $user->tokens()->delete();
            $user->update(['is_active' => false]);
            $user->delete(); // Soft delete

            return response()->json([
                'message' => 'User has associated financial records (orders/payments/store); account has been safely deactivated and archived.'
            ]);
        }

        $user->forceDelete();

        return response()->json([
            'message' => 'User deleted successfully.'
        ]);
    }

    public function pendingStudentVerifications(Request $request): JsonResponse
    {
        $users = \App\Models\User::where('student_verification_status', 'pending')
            ->latest()
            ->paginate($request->input('per_page', 10));

        $paginatedData = UserResource::collection($users)->response()->getData(true);

        return response()->json([
            'data' => $paginatedData['data'] ?? [],
            'meta' => $paginatedData['meta'] ?? [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
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
