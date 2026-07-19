<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SellRequestResource;
use App\Models\SellRequest;
use App\Services\SellRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellRequestController extends Controller
{
    public function __construct(private SellRequestService $sellRequestService) {}

    public function index(Request $request): JsonResponse
    {
        $requests = SellRequest::with(['user', 'category', 'brand'])
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => SellRequestResource::collection($requests)->response()->getData(true),
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $sellRequest = SellRequest::where('uuid', $uuid)->with(['user', 'category', 'brand'])->firstOrFail();

        return response()->json([
            'data' => new SellRequestResource($sellRequest),
        ]);
    }

    public function approve(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'offered_price' => ['required', 'numeric', 'min:0'],
        ]);

        $sellRequest = SellRequest::where('uuid', $uuid)->firstOrFail();

        $sellRequest = $this->sellRequestService->approve($sellRequest, $request->user()->id, $data['offered_price']);

        return response()->json([
            'message' => 'Sell request approved.',
            'data'    => new SellRequestResource($sellRequest),
        ]);
    }

    public function reject(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $sellRequest = SellRequest::where('uuid', $uuid)->firstOrFail();

        $sellRequest = $this->sellRequestService->reject($sellRequest, $request->user()->id, $data['reason']);

        return response()->json([
            'message' => 'Sell request rejected.',
            'data'    => new SellRequestResource($sellRequest),
        ]);
    }
}
