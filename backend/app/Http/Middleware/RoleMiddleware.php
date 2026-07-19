<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        foreach ($roles as $role) {
            // Check native enum role or Spatie permission role
            if ($request->user()->role->value === $role || $request->user()->hasRole($role)) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'Forbidden. Insufficient role.'], 403);
    }
}
