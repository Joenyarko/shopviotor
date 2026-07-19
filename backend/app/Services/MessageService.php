<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Enums\MessageStatus;
use Illuminate\Support\Facades\DB;

class MessageService
{
    public function getOrCreateConversation(int $customerId, ?int $adminId = null, ?string $subject = null): Conversation
    {
        return Conversation::firstOrCreate(
            ['customer_id' => $customerId, 'status' => 'open'],
            ['admin_id' => $adminId, 'subject' => $subject]
        );
    }

    public function sendMessage(int $senderId, Conversation $conversation, array $data): Message
    {
        return DB::transaction(function () use ($senderId, $conversation, $data) {
            $attachments = $data['attachments'] ?? [];
            unset($data['attachments']);

            $uploadedPaths = [];
            foreach ($attachments as $file) {
                $path = $file->store("messages/{$conversation->id}", 'public');
                $uploadedPaths[] = [
                    'path' => $path,
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getMimeType(),
                ];
            }

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id'       => $senderId,
                'body'            => $data['body'] ?? null,
                'attachments'     => !empty($uploadedPaths) ? $uploadedPaths : null,
                'status'          => MessageStatus::Sent->value,
            ]);

            $conversation->update(['last_message_at' => now()]);

            // Increment unread counter for the other party
            $isCustomer = $senderId === $conversation->customer_id;
            if ($isCustomer) {
                $conversation->increment('unread_admin');
            } else {
                $conversation->increment('unread_customer');
            }

            return $message->load('sender');
        });
    }

    public function markAsRead(Conversation $conversation, int $userId): void
    {
        $conversation->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now(), 'status' => MessageStatus::Read->value]);

        $isCustomer = $userId === $conversation->customer_id;
        if ($isCustomer) {
            $conversation->update(['unread_customer' => 0]);
        } else {
            $conversation->update(['unread_admin' => 0]);
        }
    }

    public function closeConversation(Conversation $conversation): void
    {
        $conversation->update(['status' => 'closed']);
    }
}
