<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\BannerCampaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerCampaignController extends Controller
{
    public function index(): JsonResponse
    {
        $campaigns = BannerCampaign::with([
            'banners' => function($query) {
                $query->orderBy('sort_order');
            },
            'promoPopups'
        ])->orderByDesc('id')->get();
        return response()->json(['data' => $campaigns]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'boolean',
        ]);

        $campaign = BannerCampaign::create([
            'name' => $data['name'],
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Campaign created successfully.',
            'data' => $campaign->load('banners')
        ], 201);
    }

    public function update(Request $request, BannerCampaign $campaign): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'boolean',
        ]);

        $campaign->update([
            'name' => $data['name'],
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Campaign updated successfully.',
            'data' => $campaign->load('banners')
        ]);
    }

    public function destroy(BannerCampaign $campaign): JsonResponse
    {
        // Delete all banners in the campaign
        $campaign->banners()->delete();
        $campaign->delete();

        return response()->json(['message' => 'Campaign deleted successfully.']);
    }
}
