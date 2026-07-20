<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminCampaignController extends Controller
{
    public function index(): JsonResponse
    {
        $campaigns = Campaign::latest()->get();
        return response()->json(['data' => $campaigns]);
    }

    public function store(Request $request): JsonResponse
    {
        $rules = [
            'title' => 'required|string|max:255',
            'target_url' => 'nullable|string',
            'start_date' => 'nullable|date',
            'is_active' => 'boolean',
            'display_location' => 'required|string',
            'image' => 'required|image|max:5120',
        ];

        if ($request->filled('start_date')) {
            $rules['end_date'] = 'nullable|date|after_or_equal:start_date';
        } else {
            $rules['end_date'] = 'nullable|date';
        }

        $validated = $request->validate($rules);

        $path = $request->file('image')->store('campaigns', 'public');

        $campaign = Campaign::create([
            'title' => $validated['title'],
            'image_path' => asset('storage/' . $path),
            'target_url' => $validated['target_url'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'is_active' => $validated['is_active'] ?? false,
            'display_location' => $validated['display_location'],
        ]);

        return response()->json([
            'message' => 'Campaign created successfully',
            'data' => $campaign
        ], 201);
    }

    public function update(Request $request, $uuid): JsonResponse
    {
        $campaign = Campaign::where('uuid', $uuid)->firstOrFail();

        $rules = [
            'title' => 'required|string|max:255',
            'target_url' => 'nullable|string',
            'start_date' => 'nullable|date',
            'is_active' => 'boolean',
            'display_location' => 'required|string',
            'image' => 'nullable|image|max:5120',
        ];

        if ($request->filled('start_date')) {
            $rules['end_date'] = 'nullable|date|after_or_equal:start_date';
        } else {
            $rules['end_date'] = 'nullable|date';
        }

        $validated = $request->validate($rules);

        $campaign->title = $validated['title'];
        $campaign->target_url = $validated['target_url'] ?? null;
        $campaign->start_date = $validated['start_date'] ?? null;
        $campaign->end_date = $validated['end_date'] ?? null;
        $campaign->is_active = $validated['is_active'] ?? false;
        $campaign->display_location = $validated['display_location'];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('campaigns', 'public');
            $campaign->image_path = asset('storage/' . $path);
        }

        $campaign->save();

        return response()->json([
            'message' => 'Campaign updated successfully',
            'data' => $campaign
        ]);
    }

    public function destroy($uuid): JsonResponse
    {
        $campaign = Campaign::where('uuid', $uuid)->firstOrFail();
        $campaign->delete();

        return response()->json([
            'message' => 'Campaign deleted successfully'
        ]);
    }
}
