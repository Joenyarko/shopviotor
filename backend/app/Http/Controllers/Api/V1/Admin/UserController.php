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
        $role = $request->input('role', 'customer');

        if ($role === 'admin') {
            $users = $this->userRepo->getAdmins($request->input('per_page', 15));
        } else {
            $users = $this->userRepo->getCustomers($request->input('per_page', 15));
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
