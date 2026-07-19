<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserReviewController extends Controller
{
    public function __construct(private ReviewService $reviewService) {}

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $review = $this->reviewService->submit($request->user()->id, $request->validated());

        return response()->json([
            'message' => 'Review submitted and is pending moderation.',
            'data'    => new ReviewResource($review),
        ], 201);
    }
}
