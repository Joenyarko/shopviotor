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

    /**
     * Get all service profiles for the authenticated user.
     */
    public function myProfiles(Request $request)
    {
        $profiles = ServiceProfile::where('user_id', $request->user()->id)
            ->with('images')
            ->latest()
            ->get();

        return response()->json(['data' => $profiles]);
    }

    /**
     * @deprecated — use myProfiles() for multiple profiles.
     * Kept for backward compatibility with existing frontend code.
     */
    public function myProfile(Request $request)
    {
        $profile = ServiceProfile::where('user_id', $request->user()->id)
            ->with('images')
            ->latest()
            ->first();

        return response()->json(['data' => $profile]);
    }

    /**
     * Create a new service profile (allows multiple per user).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'business_name'  => 'required|string|max:255',
            'bio'            => 'nullable|string',
            'category'       => 'required|string|max:100',
            'location'       => 'nullable|string|max:255',
            'city'           => 'nullable|string|max:100',
            'region'         => 'nullable|string|max:100',
            'contact_number' => 'nullable|string|max:20',
            'whatsapp_number'=> 'nullable|string|max:20',
        ]);

        $data['slug']    = Str::slug($data['business_name']) . '-' . uniqid();
        $data['user_id'] = $request->user()->id;
        $data['is_active'] = true;

        $profile = ServiceProfile::create($data);

        $this->handleImages($request, $profile);

        return response()->json([
            'message' => 'Service profile created successfully',
            'data'    => $profile->load('images'),
        ], 201);
    }

    /**
     * Update an existing profile belonging to the authenticated user.
     */
    public function update(Request $request, ?string $uuid = null)
    {
        $data = $request->validate([
            'business_name'  => 'required|string|max:255',
            'bio'            => 'nullable|string',
            'category'       => 'required|string|max:100',
            'location'       => 'nullable|string|max:255',
            'city'           => 'nullable|string|max:100',
            'region'         => 'nullable|string|max:100',
            'contact_number' => 'nullable|string|max:20',
            'whatsapp_number'=> 'nullable|string|max:20',
        ]);

        if ($uuid) {
            $profile = ServiceProfile::where('uuid', $uuid)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();
        } else {
            // Legacy: upsert on the first profile for backward compatibility
            $profile = ServiceProfile::firstOrNew(['user_id' => $request->user()->id]);
        }

        if (!$profile->exists || $profile->business_name !== $data['business_name']) {
            $data['slug'] = Str::slug($data['business_name']) . '-' . uniqid();
        }

        $profile->fill($data);
        $profile->is_active = true;
        $profile->save();

        $this->handleImages($request, $profile);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data'    => $profile->load('images'),
        ]);
    }

    /**
     * Delete (soft-delete) a service profile belonging to the authenticated user.
     */
    public function destroy(Request $request, string $uuid)
    {
        $profile = ServiceProfile::where('uuid', $uuid)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $profile->delete();

        return response()->json(['message' => 'Service profile deleted. You can create a new one at any time.']);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private function handleImages(Request $request, ServiceProfile $profile): void
    {
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                try {
                    $path = $image->storeOnCloudinary("service_profiles/{$profile->id}")->getSecurePath();
                } catch (\Exception $e) {
                    $path = $image->store('service_images', 'public');
                }
                $profile->images()->create(['path' => $path]);
            }
        }

        if ($request->has('delete_images')) {
            $imagesToDelete = $profile->images()->whereIn('id', $request->delete_images)->get();
            foreach ($imagesToDelete as $img) {
                if (!str_starts_with($img->path, 'http')) {
                    Storage::disk('public')->delete($img->path);
                }
                $img->delete();
            }
        }
    }
}
