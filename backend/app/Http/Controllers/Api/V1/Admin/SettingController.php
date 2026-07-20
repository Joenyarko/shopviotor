<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function getLayawayTerms()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'layaway_terms' => Setting::getValue('layaway_terms', '')
            ]
        ]);
    }

    public function updateLayawayTerms(Request $request)
    {
        $request->validate([
            'layaway_terms' => ['nullable', 'string']
        ]);

        Setting::updateOrCreate(
            ['key' => 'layaway_terms'],
            [
                'value' => $request->input('layaway_terms'),
                'type' => 'string',
                'group' => 'general'
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Layaway terms updated successfully.'
        ]);
    }
}
