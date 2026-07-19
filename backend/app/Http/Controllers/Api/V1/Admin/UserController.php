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
}
