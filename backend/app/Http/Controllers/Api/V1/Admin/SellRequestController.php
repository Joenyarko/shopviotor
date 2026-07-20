<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
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

    public function toggleChatStatus(Request $request, string $uuid): JsonResponse
    {
        $sellRequest = SellRequest::where('uuid', $uuid)->firstOrFail();
        $conversation = Conversation::where('related_type', SellRequest::class)
            ->where('related_id', $sellRequest->id)
            ->first();

        if (!$conversation) {
            abort(404, 'No conversation exists yet.');
        }

        $newStatus = $conversation->status === 'closed' ? 'open' : 'closed';
        $conversation->update(['status' => $newStatus]);

        return response()->json([
            'message' => "Chat $newStatus successfully.",
            'status'  => $newStatus,
        ]);
    }

    public function messages(Request $request, string $uuid): JsonResponse
    {
        $sellRequest = SellRequest::where('uuid', $uuid)->firstOrFail();

        $conversation = Conversation::where('related_type', SellRequest::class)
            ->where('related_id', $sellRequest->id)
            ->with('messages.sender')
            ->first();

        if (!$conversation) {
            return response()->json(['data' => [], 'chat_status' => 'open']);
        }

        // Reset unread for admin
        $conversation->update(['unread_admin' => 0]);

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

        // Ensure admin_id is set
        if (!$conversation->admin_id) {
            $conversation->update(['admin_id' => $request->user()->id]);
        }

        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body'      => $data['body'],
        ]);

        $conversation->update([
            'last_message_at' => now(),
            'unread_customer' => \Illuminate\Support\Facades\DB::raw('unread_customer + 1'),
        ]);

        return response()->json([
            'message' => 'Message sent.',
            'data'    => [
                'id'         => $message->id,
                'body'       => $message->body,
                'created_at' => $message->created_at,
                'is_admin'   => true,
                'sender'     => $request->user()->full_name,
            ],
        ]);
    }
}
