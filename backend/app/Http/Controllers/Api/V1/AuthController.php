<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

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
            'message' => 'Login successful.',
            'user'    => new UserResource($result['user']),
            'token'   => $result['token'],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
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
            'student_id' => $request->student_id,
            'student_verification_status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Student ID submitted successfully and is pending approval.',
            'user' => new UserResource($user),
        ]);
    }
}
