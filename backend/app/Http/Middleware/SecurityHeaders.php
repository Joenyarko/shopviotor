<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        $csp = implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://js.paystack.co https://checkout.paystack.com",
            "img-src 'self' https://res.cloudinary.com data: blob:",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "frame-src https://checkout.paystack.com",
            "connect-src 'self' https://api.paystack.co https://res.cloudinary.com",
            "object-src 'none'",
            "base-uri 'self'",
        ]);
        $response->headers->set('Content-Security-Policy', $csp);

        // Remove potentially sensitive headers
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}
