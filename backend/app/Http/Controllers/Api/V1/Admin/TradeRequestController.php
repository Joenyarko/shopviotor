<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TradeRequestResource;
use App\Models\TradeRequest;
use App\Services\TradeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TradeRequestController extends Controller
{
    public function __construct(private TradeService $tradeService) {}

    public function index(Request $request): JsonResponse
    {
        $requests = TradeRequest::with(['user', 'product', 'items'])
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => TradeRequestResource::collection($requests)->response()->getData(true),
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $trade = TradeRequest::where('uuid', $uuid)->with(['user', 'product', 'items'])->firstOrFail();

        return response()->json([
            'data' => new TradeRequestResource($trade),
        ]);
    }

    public function valueItems(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'item_values'    => ['required', 'array'],
            'item_values.*'  => ['numeric', 'min:0'],
            'product_value'  => ['required', 'numeric', 'min:0'],
        ]);

        $trade = TradeRequest::where('uuid', $uuid)->firstOrFail();

        $trade = $this->tradeService->valueItems($trade, $request->user()->id, $data['item_values'], $data['product_value']);

        return response()->json([
            'message' => 'Trade items valued successfully.',
            'data'    => new TradeRequestResource($trade),
        ]);
    }

    public function reject(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $trade = TradeRequest::where('uuid', $uuid)->firstOrFail();

        $trade = $this->tradeService->reject($trade, $request->user()->id, $data['reason']);

        return response()->json([
            'message' => 'Trade request rejected.',
            'data'    => new TradeRequestResource($trade),
        ]);
    }
}
