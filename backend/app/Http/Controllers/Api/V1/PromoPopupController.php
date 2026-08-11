<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PromoPopup;

class PromoPopupController extends Controller
{
    public function active()
    {
        $popups = PromoPopup::active()->with('campaign')->get();
        return response()->json(['data' => $popups]);
    }
}
