<?php

namespace App\Services;

use App\Events\SellRequestApproved;
use App\Models\SellRequest;
use App\Enums\SellRequestStatus;
use Illuminate\Support\Facades\DB;

class SellRequestService
{
    public function submit(int $userId, array $data): SellRequest
    {
        return DB::transaction(function () use ($userId, $data) {
            $images = $data['images'] ?? [];
            unset($data['images']);

            // Upload images
            $uploadedPaths = [];
            foreach ($images as $file) {
                $path = $file->store("sell-requests/{$userId}", 'public');
                $uploadedPaths[] = $path;
            }

            return SellRequest::create(array_merge($data, [
                'user_id' => $userId,
                'images'  => $uploadedPaths,
                'status'  => SellRequestStatus::Pending->value,
            ]));
        });
    }

    public function update(SellRequest $request, array $data): SellRequest
    {
        return DB::transaction(function () use ($request, $data) {
            $images = $data['images'] ?? [];
            unset($data['images']);

            if (!empty($images)) {
                $uploadedPaths = [];
                foreach ($images as $file) {
                    $path = $file->store("sell-requests/{$request->user_id}", 'public');
                    $uploadedPaths[] = $path;
                }
                $data['images'] = $uploadedPaths;
            }

            $request->update($data);

            return $request->fresh();
        });
    }

    public function delete(SellRequest $request): void
    {
        $request->delete();
    }

    public function approve(SellRequest $request, int $reviewerId, float $offeredPrice): SellRequest
    {
        $request->update([
            'status'        => SellRequestStatus::Approved->value,
            'offered_price' => $offeredPrice,
            'reviewed_by'   => $reviewerId,
            'reviewed_at'   => now(),
        ]);

        event(new SellRequestApproved($request));

        return $request->fresh();
    }

    public function reject(SellRequest $request, int $reviewerId, string $reason): SellRequest
    {
        $request->update([
            'status'           => SellRequestStatus::Rejected->value,
            'rejection_reason' => $reason,
            'reviewed_by'      => $reviewerId,
            'reviewed_at'      => now(),
        ]);

        return $request->fresh();
    }

    public function makeCounterOffer(SellRequest $request, int $reviewerId, float $counterPrice): SellRequest
    {
        $request->update([
            'status'               => SellRequestStatus::CounterOffer->value,
            'counter_offer_price'  => $counterPrice,
            'reviewed_by'          => $reviewerId,
            'reviewed_at'          => now(),
        ]);

        return $request->fresh();
    }

    public function schedulePickup(SellRequest $request, string $pickupAt, string $address): SellRequest
    {
        $request->update([
            'status'               => SellRequestStatus::PickupScheduled->value,
            'pickup_scheduled_at'  => $pickupAt,
            'pickup_address'       => $address,
        ]);

        return $request->fresh();
    }

    public function markInspecting(SellRequest $request): SellRequest
    {
        $request->update([
            'status'       => SellRequestStatus::Inspecting->value,
            'inspected_at' => now(),
        ]);

        return $request->fresh();
    }

    public function complete(SellRequest $request): SellRequest
    {
        $request->update([
            'status'   => SellRequestStatus::Completed->value,
            'paid_at'  => now(),
        ]);

        return $request->fresh();
    }
}
