<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoPopup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PromoPopupController extends Controller
{
    public function index()
    {
        $popups = PromoPopup::latest()->get();
        return response()->json(['data' => $popups]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:20480',
            'target_page' => 'nullable|string',
            'link_url' => 'nullable|string|max:255',
            'banner_campaign_id' => 'required|exists:banner_campaigns,id',
        ]);

        $path = $request->file('image')->storeOnCloudinary('popups')->getSecurePath();

        $popup = PromoPopup::create([
            'image_path' => $path,
            'target_page' => $request->target_page ?? 'all',
            'link_url' => $request->link_url,
            'is_active' => true,
            'banner_campaign_id' => $request->banner_campaign_id,
        ]);

        return response()->json(['message' => 'Promo popup created.', 'data' => $popup], 201);
    }

    public function update(Request $request, $uuid)
    {
        $popup = PromoPopup::where('uuid', $uuid)->firstOrFail();
        
        $request->validate([
            'image' => 'nullable|image|max:20480',
            'target_page' => 'nullable|string',
            'link_url' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'banner_campaign_id' => 'required|exists:banner_campaigns,id',
        ]);

        if ($request->hasFile('image')) {
            if (Storage::disk('public')->exists($popup->image_path)) {
                Storage::disk('public')->delete($popup->image_path);
            }
            $popup->image_path = $request->file('image')->storeOnCloudinary('popups')->getSecurePath();
        }

        if ($request->has('target_page')) $popup->target_page = $request->target_page;
        if ($request->has('link_url')) $popup->link_url = $request->link_url;
        if ($request->has('is_active')) $popup->is_active = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
        if ($request->has('banner_campaign_id')) $popup->banner_campaign_id = $request->banner_campaign_id;

        $popup->save();

        return response()->json(['message' => 'Promo popup updated.', 'data' => $popup]);
    }

    public function destroy($uuid)
    {
        $popup = PromoPopup::where('uuid', $uuid)->firstOrFail();
        if (Storage::disk('public')->exists($popup->image_path)) {
            Storage::disk('public')->delete($popup->image_path);
        }
        $popup->delete();

        return response()->json(['message' => 'Promo popup deleted.']);
    }
}
