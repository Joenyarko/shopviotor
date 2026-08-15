<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PickupLocation;
use Illuminate\Http\Request;

class PickupLocationController extends Controller
{
    public function index(Request $request)
    {
        $query = PickupLocation::query();
        
        if ($request->has('active_only') && $request->active_only == 'true') {
            $query->where('is_active', true);
        }
        
        return response()->json([
            'success' => true,
            'data' => $query->orderBy('name', 'asc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean'
        ]);

        $location = PickupLocation::create([
            'name' => $request->name,
            'is_active' => $request->has('is_active') ? $request->is_active : true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pickup location created successfully.',
            'data' => $location
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'string|max:255',
            'is_active' => 'boolean'
        ]);

        $location = PickupLocation::findOrFail($id);
        $location->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Pickup location updated successfully.',
            'data' => $location
        ]);
    }

    public function destroy($id)
    {
        $location = PickupLocation::findOrFail($id);
        $location->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pickup location deleted successfully.'
        ]);
    }
}
