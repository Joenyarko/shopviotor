<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ServiceProfile;
use App\Models\ServiceImage;
use App\Models\ServiceCategory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ServiceProfileController extends Controller
{
    public function categories()
    {
        $categories = ServiceCategory::where('is_active', true)->orderBy('name')->pluck('name');
        return response()->json(['data' => $categories]);
    }
    public function index(Request $request)
    {
        $query = ServiceProfile::where('is_active', true)->with('images');

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('bio', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'data' => $query->paginate(20)
        ]);
    }

    public function show($slug)
    {
        $profile = ServiceProfile::where('slug', $slug)
            ->where('is_active', true)
            ->with(['images', 'user'])
            ->firstOrFail();

        return response()->json(['data' => $profile]);
    }

    public function myProfile(Request $request)
    {
        $profile = ServiceProfile::where('user_id', $request->user()->id)
            ->with('images')
            ->first();
            
        return response()->json(['data' => $profile]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'business_name' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'category' => 'required|string|max:100',
            'location' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'region' => 'nullable|string|max:100',
            'contact_number' => 'nullable|string|max:20',
            'whatsapp_number' => 'nullable|string|max:20',
        ]);

        $profile = ServiceProfile::firstOrNew(['user_id' => $request->user()->id]);
        
        if (!$profile->exists || $profile->business_name !== $data['business_name']) {
            $data['slug'] = Str::slug($data['business_name']) . '-' . uniqid();
        }

        $profile->fill($data);
        $profile->is_active = true;
        $profile->save();

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                // If cloudinary is configured, we can use it. But we'll try-catch in case it's not.
                try {
                    $path = $image->storeOnCloudinary("service_profiles/{$profile->id}")->getSecurePath();
                } catch (\Exception $e) {
                    // Fallback to local public disk if Cloudinary fails or isn't installed
                    $path = $image->store('service_images', 'public');
                }
                $profile->images()->create(['path' => $path]);
            }
        }

        if ($request->has('delete_images')) {
            $imagesToDelete = $profile->images()->whereIn('id', $request->delete_images)->get();
            foreach ($imagesToDelete as $img) {
                if (str_starts_with($img->path, 'http')) {
                    // If we stored the Cloudinary URL, we can attempt to delete it using the facade if needed,
                    // but usually just deleting the DB record is enough for now to remove it from the UI.
                } else {
                    Storage::disk('public')->delete($img->path);
                }
                $img->delete();
            }
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $profile->load('images')
        ]);
    }
}
