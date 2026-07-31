<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ServiceCategory;

class ServiceCategoryController extends Controller
{
    public function index()
    {
        $categories = ServiceCategory::orderBy('name')->get();
        return response()->json(['data' => $categories]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:service_categories,name',
            'is_active' => 'boolean'
        ]);

        $category = ServiceCategory::create([
            'name' => $data['name'],
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json(['data' => $category, 'message' => 'Category created successfully']);
    }

    public function update(Request $request, $id)
    {
        $category = ServiceCategory::findOrFail($id);
        
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:service_categories,name,' . $category->id,
            'is_active' => 'boolean'
        ]);

        $category->update($data);

        return response()->json(['data' => $category, 'message' => 'Category updated successfully']);
    }

    public function destroy($id)
    {
        $category = ServiceCategory::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
