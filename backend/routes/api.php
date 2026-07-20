<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AddressController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\BrandController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\UserReviewController;
use App\Http\Controllers\Api\V1\WishlistController;
use App\Http\Controllers\Api\V1\SellRequestController;
use App\Http\Controllers\Api\V1\TradeRequestController;
use App\Http\Controllers\Api\V1\HirePurchaseController;
use App\Http\Controllers\Api\V1\RaffleController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\AiChatController;
use App\Http\Controllers\Api\V1\MarketingController;
use App\Http\Controllers\Api\V1\LayawayController;
use App\Http\Controllers\Api\V1\StoreController;
use App\Http\Controllers\Api\V1\Vendor\VendorProductController;
use App\Http\Controllers\Api\V1\Vendor\VendorDashboardController;

// Admin Controllers
use App\Http\Controllers\Api\V1\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\V1\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\V1\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\SellRequestController as AdminSellRequestController;
use App\Http\Controllers\Api\V1\Admin\TradeRequestController as AdminTradeRequestController;
use App\Http\Controllers\Api\V1\Admin\AdminCampaignController;
use App\Http\Controllers\Api\V1\Admin\AdminFlashSaleController;
use App\Http\Controllers\Api\V1\Admin\AdminCollectionController;
use App\Http\Controllers\Api\V1\Admin\AdminHirePurchaseController;
use App\Http\Controllers\Api\V1\Admin\AdminLayawayController;
use App\Http\Controllers\Api\V1\Admin\AdminStoreController;

Route::prefix('v1')->group(function () {
    
    // ─── PUBLIC ROUTES ────────────────────────────────────────────────────────
    
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Catalog
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);
    
    Route::get('/brands', [BrandController::class, 'index']);
    Route::get('/brands/{slug}', [BrandController::class, 'show']);
    
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/search', [ProductController::class, 'search']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/{uuid}', [ProductController::class, 'show']);

    // Public Stores
    Route::get('/stores', [StoreController::class, 'index']);
    Route::get('/stores/{slug}', [StoreController::class, 'show']);

    Route::get('/raffles', [RaffleController::class, 'index']);
    Route::get('/raffles/{uuid}', [RaffleController::class, 'show']);

    // Webhooks
    Route::post('/payments/webhook/{gateway}', [PaymentController::class, 'webhook']);

    // AI Chat — public (no auth required so guests can also use it)
    Route::post('/ai/chat', [AiChatController::class, 'chat'])->middleware('throttle:30,1');

    // Marketing (Public)
    Route::get('/marketing/campaigns/active', [MarketingController::class, 'activeCampaigns']);
    Route::get('/marketing/flash-sales/active', [MarketingController::class, 'activeFlashSales']);
    Route::get('/marketing/collections', [MarketingController::class, 'collections']);

    // ─── AUTHENTICATED ROUTES ─────────────────────────────────────────────────
    
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth / User Profile
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Address Book
        Route::apiResource('addresses', AddressController::class)->except(['show']);

        // Checkout & Orders
        Route::post('/checkout', [CheckoutController::class, 'process']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{uuid}', [OrderController::class, 'show']);
        Route::post('/orders/{uuid}/cancel', [OrderController::class, 'cancel']);

        // Payments
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::get('/payments/{uuid}', [PaymentController::class, 'show']);
        Route::get('/payments/verify/{reference}', [PaymentController::class, 'verify']);

        // Reviews & Wishlist
        Route::post('/reviews', [UserReviewController::class, 'store']);
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist/toggle/{productId}', [WishlistController::class, 'toggle']);

        // Marketplace Services
        Route::apiResource('sell-requests', SellRequestController::class)->parameters(['sell-requests' => 'uuid']);
        Route::post('/sell-requests/{uuid}', [SellRequestController::class, 'update']); // for FormData update
        Route::get('/sell-requests/{uuid}/messages', [SellRequestController::class, 'messages']);
        Route::post('/sell-requests/{uuid}/messages', [SellRequestController::class, 'sendMessage']);
        
        Route::apiResource('trade-requests', TradeRequestController::class)->only(['index', 'store', 'show']);
        Route::post('/trade-requests/{uuid}/accept', [TradeRequestController::class, 'acceptValuation']);

        Route::apiResource('hire-purchases', HirePurchaseController::class)->only(['index', 'store', 'show']);
        Route::post('/hire-purchases/{uuid}/installments/{id}/pay', [HirePurchaseController::class, 'payInstallment']);

        Route::post('/raffles/{uuid}/purchase-ticket', [RaffleController::class, 'purchaseTicket']);

        // Customer Support Chat
        Route::apiResource('messages', MessageController::class)->only(['index', 'store', 'show']);

        // Layaway (Susu-style)
        Route::get('/layaways', [LayawayController::class, 'index']);
        Route::post('/layaways', [LayawayController::class, 'store']);
        Route::get('/layaways/{uuid}', [LayawayController::class, 'show']);
        Route::post('/layaways/{uuid}/pay', [LayawayController::class, 'pay']);

        // Store Application (any authenticated user can apply)
        Route::post('/stores/apply', [StoreController::class, 'apply']);
        Route::get('/stores/my-store', [StoreController::class, 'myStore']);
        Route::post('/stores/my-store/update', [StoreController::class, 'update']);

        // Vendor Routes (requires active store and vendor role)
        Route::prefix('vendor')->middleware('role:vendor,admin,super_admin')->group(function () {
            Route::get('/dashboard', [VendorDashboardController::class, 'index']);
            Route::get('/products', [VendorProductController::class, 'index']);
            Route::post('/products', [VendorProductController::class, 'store']);
            Route::post('/products/{uuid}', [VendorProductController::class, 'update']);
            Route::delete('/products/{uuid}', [VendorProductController::class, 'destroy']);
        });

        // ─── ADMIN ROUTES ─────────────────────────────────────────────────────────
        
        Route::prefix('admin')->middleware('role:admin,super_admin')->group(function () {
            // Dashboard Stats
            Route::get('/orders/stats', [AdminOrderController::class, 'stats']);

            // Users
            Route::apiResource('users', AdminUserController::class)->only(['index', 'show']);
            Route::post('/users/{uuid}/toggle-status', [AdminUserController::class, 'toggleStatus']);

            // Categories
            Route::apiResource('categories', AdminCategoryController::class);

            // Brands
            Route::apiResource('brands', \App\Http\Controllers\Api\V1\Admin\BrandController::class);

            // Products
            Route::apiResource('products', AdminProductController::class);

            // Orders
            Route::get('/orders', [AdminOrderController::class, 'index']);
            Route::get('/orders/{uuid}', [AdminOrderController::class, 'show']);
            Route::put('/orders/{uuid}/status', [AdminOrderController::class, 'updateStatus']);

            // Sell Requests
            Route::get('/sell-requests', [AdminSellRequestController::class, 'index']);
            Route::get('/sell-requests/{uuid}', [AdminSellRequestController::class, 'show']);
            Route::post('/sell-requests/{uuid}/approve', [AdminSellRequestController::class, 'approve']);
            Route::post('/sell-requests/{uuid}/reject', [AdminSellRequestController::class, 'reject']);
            Route::get('/sell-requests/{uuid}/messages', [AdminSellRequestController::class, 'messages']);
            Route::post('/sell-requests/{uuid}/messages', [AdminSellRequestController::class, 'sendMessage']);
            Route::post('/sell-requests/{uuid}/toggle-chat', [AdminSellRequestController::class, 'toggleChatStatus']);

            // Trade Requests
            Route::get('/trade-requests', [AdminTradeRequestController::class, 'index']);
            Route::get('/trade-requests/{uuid}', [AdminTradeRequestController::class, 'show']);
            Route::post('/trade-requests/{uuid}/value', [AdminTradeRequestController::class, 'valueItems']);
            Route::post('/trade-requests/{uuid}/reject', [AdminTradeRequestController::class, 'reject']);

            // Hire Purchase
            Route::get('/hire-purchases', [AdminHirePurchaseController::class, 'index']);
            Route::get('/hire-purchases/{uuid}', [AdminHirePurchaseController::class, 'show']);
            Route::post('/hire-purchases/{uuid}/status', [AdminHirePurchaseController::class, 'updateStatus']);

            // Layaway (Admin)
            Route::get('/layaways', [AdminLayawayController::class, 'index']);
            Route::get('/layaways/{uuid}', [AdminLayawayController::class, 'show']);
            Route::post('/layaways/{uuid}/release', [AdminLayawayController::class, 'release']);
            Route::post('/layaways/{uuid}/cancel', [AdminLayawayController::class, 'cancel']);

            // Vendor Stores (Admin)
            Route::get('/stores', [AdminStoreController::class, 'index']);
            Route::post('/stores/{uuid}/approve', [AdminStoreController::class, 'approve']);
            Route::post('/stores/{uuid}/suspend', [AdminStoreController::class, 'suspend']);
            Route::post('/stores/{uuid}/restore', [AdminStoreController::class, 'restore']);
            Route::post('/stores/{uuid}/commission', [AdminStoreController::class, 'updateCommission']);

            // Admin Marketing
        Route::apiResource('marketing/campaigns', AdminCampaignController::class)->parameters(['campaigns' => 'uuid']);
        Route::post('marketing/campaigns/{uuid}', [AdminCampaignController::class, 'update']); // Use POST for FormData with _method=PUT later if needed, or stick to POST for file uploads
        Route::apiResource('marketing/flash-sales', AdminFlashSaleController::class)->parameters(['flash-sales' => 'uuid']);
        Route::apiResource('marketing/collections', AdminCollectionController::class)->parameters(['collections' => 'uuid']);
    });
    });
});
