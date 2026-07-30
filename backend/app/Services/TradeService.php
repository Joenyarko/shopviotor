<?php

namespace App\Services;

use App\Events\TradeCompleted;
use App\Models\TradeRequest;
use App\Enums\TradeRequestStatus;
use Illuminate\Support\Facades\DB;

class TradeService
{
    public function submit(int $userId, array $data): TradeRequest
    {
        return DB::transaction(function () use ($userId, $data) {
            $items = $data['items'] ?? [];
            unset($data['items']);

            $trade = TradeRequest::create(array_merge($data, [
                'user_id' => $userId,
                'status'  => TradeRequestStatus::Pending->value,
            ]));

            foreach ($items as $item) {
                $images = $item['images'] ?? [];
                unset($item['images']);

                $uploadedPaths = [];
                foreach ($images as $file) {
                    $path = $file->storeOnCloudinary("trade-requests/{$trade->id}")->getSecurePath();
                    $uploadedPaths[] = $path;
                }

                $trade->items()->create(array_merge($item, ['images' => $uploadedPaths]));
            }

            return $trade->load('items');
        });
    }

    public function valueItems(TradeRequest $trade, int $reviewerId, array $itemValues, float $productValue): TradeRequest
    {
        return DB::transaction(function () use ($trade, $reviewerId, $itemValues, $productValue) {
            foreach ($itemValues as $itemId => $value) {
                $trade->items()->where('id', $itemId)->update(['admin_valued_at' => $value]);
            }

            $targetPrice = $trade->product?->price ?? 0;
            $difference  = max(0, $targetPrice - $productValue);

            $trade->update([
                'status'               => TradeRequestStatus::Valued->value,
                'product_value'        => $productValue,
                'target_product_price' => $targetPrice,
                'difference'           => $difference,
                'reviewed_by'          => $reviewerId,
                'reviewed_at'          => now(),
            ]);

            return $trade->fresh('items');
        });
    }

    public function accept(TradeRequest $trade): TradeRequest
    {
        $status = $trade->difference > 0
            ? TradeRequestStatus::PaymentRequired->value
            : TradeRequestStatus::Accepted->value;

        $trade->update(['status' => $status]);

        return $trade->fresh();
    }

    public function complete(TradeRequest $trade): TradeRequest
    {
        $trade->update([
            'status'       => TradeRequestStatus::Completed->value,
            'completed_at' => now(),
        ]);

        event(new TradeCompleted($trade));

        return $trade->fresh();
    }

    public function reject(TradeRequest $trade, int $reviewerId, string $reason): TradeRequest
    {
        $trade->update([
            'status'      => TradeRequestStatus::Rejected->value,
            'admin_notes' => $reason,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
        ]);

        return $trade->fresh();
    }
}
