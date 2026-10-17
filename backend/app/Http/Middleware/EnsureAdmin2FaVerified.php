<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Cache;

class EnsureAdmin2FaVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Allow OTP send and verification routes
        if ($request->is('*admin/otp/*') || $request->is('*/otp/*')) {
            return $next($request);
        }

        if ($user && $user->isAdmin()) {
            $isVerified = Cache::get('admin_2fa_verified_' . $user->id);
            if (!$isVerified) {
                return response()->json([
                    'message' => 'Admin 2FA verification required before accessing admin endpoints.',
                    'requires_admin_2fa' => true,
                ], 403);
            }
        }

        return $next($request);
    }
}
