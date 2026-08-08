<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AppInstall;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    /**
     * Record a new PWA app install event.
     * Public route — no auth required so even guest installs are tracked.
     */
    public function recordInstall(Request $request): JsonResponse
    {
        $ua         = $request->userAgent() ?? '';
        $platform   = $this->detectPlatform($ua);
        $userId     = $request->user()?->id;

        AppInstall::create([
            'user_id'    => $userId,
            'platform'   => $platform,
            'user_agent' => substr($ua, 0, 500),
        ]);

        return response()->json(['message' => 'Install recorded.'], 201);
    }

    /**
     * Return total install counts for admin dashboard.
     */
    public function installStats(): JsonResponse
    {
        $total    = AppInstall::count();
        $android  = AppInstall::where('platform', 'android')->count();
        $ios      = AppInstall::where('platform', 'ios')->count();
        $desktop  = AppInstall::where('platform', 'desktop')->count();

        $recent = AppInstall::selectRaw("DATE(created_at) as date, COUNT(*) as count")
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'total'   => $total,
            'android' => $android,
            'ios'     => $ios,
            'desktop' => $desktop,
            'recent'  => $recent,
        ]);
    }

    private function detectPlatform(string $ua): string
    {
        $ua = strtolower($ua);
        if (str_contains($ua, 'iphone') || str_contains($ua, 'ipad') || str_contains($ua, 'ipod')) {
            return 'ios';
        }
        if (str_contains($ua, 'android')) {
            return 'android';
        }
        return 'desktop';
    }
}
