<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\SubmitSellRequest;
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
        $requests = SellRequest::where('user_id', $request->user()->id)
            ->with(['category', 'brand'])
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => SellRequestResource::collection($requests)->response()->getData(true),
        ]);
    }

    public function store(SubmitSellRequest $request): JsonResponse
    {
        $sellRequest = $this->sellRequestService->submit($request->user()->id, $request->validated());

        return response()->json([
            'message' => 'Sell request submitted successfully.',
            'data'    => new SellRequestResource($sellRequest),
        ], 201);
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $sellRequest = SellRequest::where('uuid', $uuid)->with(['category', 'brand'])->firstOrFail();

        if ($request->user()->id !== $sellRequest->user_id && !$request->user()->isAdmin()) {
            abort(403);
        }

        return response()->json([
            'data' => new SellRequestResource($sellRequest),
        ]);
    }
}
