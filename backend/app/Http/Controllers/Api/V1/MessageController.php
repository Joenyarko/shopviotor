<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function __construct(private MessageService $messageService) {}

    public function index(Request $request): JsonResponse
    {
        $conversations = Conversation::where('customer_id', $request->user()->id)
            ->with(['latestMessage', 'admin:id,first_name,last_name,avatar'])
            ->latest('last_message_at')
            ->get();

        return response()->json([
            'data' => $conversations,
        ]);
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $conversation = Conversation::where('uuid', $uuid)->firstOrFail();

        if ($request->user()->cannot('view', $conversation)) {
            abort(403);
        }

        $this->messageService->markAsRead($conversation, $request->user()->id);

        $messages = $conversation->messages()->with('sender:id,first_name,last_name,avatar')->get();

        return response()->json([
            'conversation' => $conversation,
            'messages'     => $messages,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'body'          => ['required_without:attachments', 'string', 'nullable'],
            'attachments'   => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'max:10240'], // 10MB max per file
        ]);

        $conversation = $this->messageService->getOrCreateConversation($request->user()->id);

        $message = $this->messageService->sendMessage($request->user()->id, $conversation, $data);

        return response()->json([
            'message' => 'Message sent.',
            'data'    => $message->load('sender:id,first_name,last_name,avatar'),
        ], 201);
    }
}
