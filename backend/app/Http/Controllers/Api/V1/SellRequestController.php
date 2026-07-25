<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\SubmitSellRequest;
use App\Http\Requests\Service\UpdateSellRequest;
use App\Http\Resources\SellRequestResource;
use App\Models\SellRequest;
use App\Models\Conversation;
use App\Models\Message;
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
        $validated = $request->validated();

        $validated['category_id'] = \App\Models\Category::where('uuid', $validated['category_id'])->value('id');
        if (!empty($validated['brand_id'])) {
            $validated['brand_id'] = \App\Models\Brand::where('uuid', $validated['brand_id'])->value('id');
        }

        $sellRequest = $this->sellRequestService->submit($request->user()->id, $validated);

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

    public function update(UpdateSellRequest $request, string $uuid): JsonResponse
    {
        $sellRequest = SellRequest::where('uuid', $uuid)->firstOrFail();

        if ($request->user()->id !== $sellRequest->user_id) {
            abort(403);
        }

        if ($sellRequest->status->value !== 'pending') {
            abort(400, 'Only pending requests can be updated.');
        }

        $validated = $request->validated();
        $validated['category_id'] = \App\Models\Category::where('uuid', $validated['category_id'])->value('id');
        if (!empty($validated['brand_id'])) {
            $validated['brand_id'] = \App\Models\Brand::where('uuid', $validated['brand_id'])->value('id');
        }

        $sellRequest = $this->sellRequestService->update($sellRequest, $validated);

        return response()->json([
            'message' => 'Sell request updated successfully.',
            'data'    => new SellRequestResource($sellRequest),
        ]);
    }

    public function destroy(Request $request, string $uuid): JsonResponse
    {
        $sellRequest = SellRequest::where('uuid', $uuid)->firstOrFail();

        if ($request->user()->id !== $sellRequest->user_id) {
            abort(403);
        }

        if (!in_array($sellRequest->status->value, ['pending', 'rejected', 'cancelled'])) {
            abort(400, 'Only pending or rejected requests can be deleted.');
        }

        $this->sellRequestService->delete($sellRequest);

        return response()->json([
            'message' => 'Sell request deleted successfully.',
        ]);
    }

    public function acceptOffer(Request $request, string $uuid): JsonResponse
    {
        $sellRequest = SellRequest::where('uuid', $uuid)->firstOrFail();

        if ($request->user()->id !== $sellRequest->user_id) {
            abort(403);
        }

        $sellRequest->update(['status' => 'accepted']);

        return response()->json([
            'message' => 'Offer accepted successfully.',
        ]);
    }

    public function rejectOffer(Request $request, string $uuid): JsonResponse
    {
        $sellRequest = SellRequest::where('uuid', $uuid)->firstOrFail();

        if ($request->user()->id !== $sellRequest->user_id) {
            abort(403);
        }

        $sellRequest->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Offer rejected successfully.',
        ]);
    }
}
