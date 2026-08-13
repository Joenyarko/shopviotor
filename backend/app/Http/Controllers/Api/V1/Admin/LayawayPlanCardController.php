<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\LayawayPlanCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LayawayPlanCardController extends Controller
{
    public function index(Request $request)
    {
        $query = LayawayPlanCard::query();
        
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $perPage = $request->input('per_page', 12);
        $cards = $query->latest()->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $cards->items(),
            'meta' => [
                'current_page' => $cards->currentPage(),
                'last_page' => $cards->lastPage(),
                'total' => $cards->total(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'number_of_boxes' => 'required|integer|min:1',
            'price_per_box' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:active,inactive'
        ]);

        $data = $request->except('image');
        $data['uuid'] = Str::uuid()->toString();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('layaway_cards', 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        $card = LayawayPlanCard::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Layaway Card created successfully',
            'data' => $card
        ], 201);
    }

    public function update(Request $request, $uuid)
    {
        $card = LayawayPlanCard::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'name' => 'required|string|max:255',
            'number_of_boxes' => 'required|integer|min:1',
            'price_per_box' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:active,inactive'
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            // Delete old image
            if ($card->image_url && str_starts_with($card->image_url, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $card->image_url));
            }
            $path = $request->file('image')->store('layaway_cards', 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        $card->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Layaway Card updated successfully',
            'data' => $card
        ]);
    }

    public function destroy($uuid)
    {
        $card = LayawayPlanCard::where('uuid', $uuid)->firstOrFail();
        
        if ($card->image_url && str_starts_with($card->image_url, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $card->image_url));
        }

        $card->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Layaway Card deleted successfully'
        ]);
    }
}
