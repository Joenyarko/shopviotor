<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $banners = Banner::orderBy('sort_order')->orderByDesc('id')->get();
        
        $formatted = $banners->map(function ($banner) {
            return [
                'id' => $banner->id,
                'title' => $banner->title,
                'subtitle' => $banner->subtitle,
                'image_url' => $banner->image_url,
                'link' => $banner->link,
                'position' => $banner->position,
                'is_active' => $banner->is_active,
                'sort_order' => $banner->sort_order,
                'banner_campaign_id' => $banner->banner_campaign_id,
            ];
        });

        return response()->json(['data' => $formatted]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'link' => 'nullable|string|max:255',
            'position' => 'required|string|max:50',
            'is_active' => 'boolean',
            'image' => 'required|image|mimes:jpeg,png,webp,gif|max:20480',
            'banner_campaign_id' => 'required|exists:banner_campaigns,id',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->storeOnCloudinary('banners')->getSecurePath();
        }

        $data['title'] = $data['title'] ?? '';
        $data['subtitle'] = $data['subtitle'] ?? '';
        $data['link'] = $data['link'] ?? '';
        $data['is_active'] = $request->input('is_active', true);
        $data['sort_order'] = Banner::where('banner_campaign_id', $data['banner_campaign_id'])->max('sort_order') + 1;
        $data['banner_campaign_id'] = $data['banner_campaign_id'];

        $banner = Banner::create($data);

        return response()->json([
            'message' => 'Banner created successfully.',
            'data' => $banner
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);

        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'link' => 'nullable|string|max:255',
            'position' => 'required|string|max:50',
            'is_active' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,webp,gif|max:20480',
            'banner_campaign_id' => 'required|exists:banner_campaigns,id',
        ]);

        if ($request->hasFile('image')) {
            if ($banner->image && !\Illuminate\Support\Str::startsWith($banner->image, ['http://', 'https://'])) {
                Storage::disk('public')->delete($banner->image);
            }
            $data['image'] = $request->file('image')->storeOnCloudinary('banners')->getSecurePath();
        }

        $data['title'] = $data['title'] ?? '';
        $data['subtitle'] = $data['subtitle'] ?? '';
        $data['link'] = $data['link'] ?? '';

        if ($request->has('is_active')) {
            $data['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        $banner->update($data);

        return response()->json([
            'message' => 'Banner updated successfully.',
            'data' => $banner
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);
        
        if ($banner->image) {
            Storage::disk('public')->delete($banner->image);
        }
        
        $banner->delete();

        return response()->json([
            'message' => 'Banner deleted successfully.'
        ]);
    }
}
