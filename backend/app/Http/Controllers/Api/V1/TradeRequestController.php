<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\SubmitTradeRequest;
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
        $requests = TradeRequest::where('user_id', $request->user()->id)
            ->with(['product.primaryImage', 'items'])
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => TradeRequestResource::collection($requests)->response()->getData(true),
        ]);
    }

    public function store(SubmitTradeRequest $request): JsonResponse
    {
        $trade = $this->tradeService->submit($request->user()->id, $request->validated());

        return response()->json([
            'message' => 'Trade request submitted successfully.',
            'data'    => new TradeRequestResource($trade),
        ], 201);
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $trade = TradeRequest::where('uuid', $uuid)->with(['product', 'items'])->firstOrFail();

        if ($request->user()->id !== $trade->user_id && !$request->user()->isAdmin()) {
            abort(403);
        }

        return response()->json([
            'data' => new TradeRequestResource($trade),
        ]);
    }

    public function acceptValuation(Request $request, string $uuid): JsonResponse
    {
        $trade = TradeRequest::where('uuid', $uuid)->firstOrFail();

        if ($request->user()->id !== $trade->user_id) {
            abort(403);
        }

        if ($trade->status->value !== 'valued') {
            abort(400, 'Trade request is not pending valuation acceptance.');
        }

        $trade = $this->tradeService->accept($trade);

        return response()->json([
            'message' => 'Valuation accepted.',
            'data'    => new TradeRequestResource($trade),
        ]);
    }
}
