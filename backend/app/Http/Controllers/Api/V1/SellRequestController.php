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

        if ($sellRequest->status->value !== 'pending') {
            abort(400, 'Only pending requests can be deleted.');
        }

        $this->sellRequestService->delete($sellRequest);

        return response()->json([
            'message' => 'Sell request deleted successfully.',
        ]);
    }

    public function messages(Request $request, string $uuid): JsonResponse
    {
        $sellRequest = SellRequest::where('uuid', $uuid)->firstOrFail();

        if ($request->user()->id !== $sellRequest->user_id) {
            abort(403);
        }

        $conversation = Conversation::where('related_type', SellRequest::class)
            ->where('related_id', $sellRequest->id)
            ->with('messages.sender')
            ->first();

        if (!$conversation) {
            return response()->json(['data' => [], 'chat_status' => 'open']);
        }

        return response()->json([
            'chat_status' => $conversation->status,
            'data' => $conversation->messages->map(fn($m) => [
                'id'         => $m->id,
                'body'       => $m->body,
                'created_at' => $m->created_at,
                'is_admin'   => $m->sender->isAdmin(),
                'sender'     => $m->sender->full_name,
            ]),
        ]);
    }

    public function sendMessage(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate(['body' => 'required|string']);
        $sellRequest = SellRequest::where('uuid', $uuid)->firstOrFail();

        if ($request->user()->id !== $sellRequest->user_id) {
            abort(403);
        }

        $conversation = Conversation::firstOrCreate(
            [
                'related_type' => SellRequest::class,
                'related_id'   => $sellRequest->id,
            ],
            [
                'uuid'        => (string) \Illuminate\Support\Str::uuid(),
                'customer_id' => $sellRequest->user_id,
                'subject'     => "Sell Request: {$sellRequest->item_name}",
            ]
        );

        if ($conversation->status === 'closed') {
            abort(400, 'This chat has been closed by an admin.');
        }

        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body'      => $data['body'],
        ]);

        $conversation->update([
            'last_message_at' => now(),
            'unread_admin'    => \Illuminate\Support\Facades\DB::raw('unread_admin + 1'),
        ]);

        return response()->json([
            'message' => 'Message sent.',
            'data'    => [
                'id'         => $message->id,
                'body'       => $message->body,
                'created_at' => $message->created_at,
                'is_admin'   => false,
                'sender'     => $request->user()->full_name,
            ],
        ]);
    }
}
