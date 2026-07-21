<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $position = $request->query('position');

        $query = Banner::active()->orderBy('sort_order');

        if ($position) {
            $query->where('position', $position);
        }

        $banners = $query->get()->map(function ($banner) {
            return [
                'id' => $banner->id,
                'title' => $banner->title,
                'subtitle' => $banner->subtitle,
                'image_url' => $banner->image_url,
                'link' => $banner->link,
                'position' => $banner->position,
            ];
        });

        return response()->json(['data' => $banners]);
    }
}
