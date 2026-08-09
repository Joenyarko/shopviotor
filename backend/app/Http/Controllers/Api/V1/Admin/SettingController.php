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

    public function getSettings()
    {
        // Fetch all known settings by key and return as a flat map
        $keys = ['site_name', 'tax_rate', 'default_shipping_fee', 'momo_tax'];
        $settings = Setting::whereIn('key', $keys)->pluck('value', 'key');
        return response()->json([
            'data' => $settings
        ]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'default_shipping_fee' => ['nullable', 'numeric', 'min:0'],
            'tax_rate'             => ['nullable', 'numeric', 'min:0'],
            'site_name'            => ['nullable', 'string', 'max:255'],
        ]);

        foreach ($data as $key => $value) {
            if ($value === null) continue;
            // Use only key/value columns which are guaranteed to exist
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json([
            'message' => 'Settings updated successfully.'
        ]);
    }
}
