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
use App\Http\Controllers\Api\V1\BannerController;
use App\Http\Controllers\Api\V1\Vendor\VendorProductController;
use App\Http\Controllers\Api\V1\Vendor\VendorDashboardController;
use App\Http\Controllers\Api\V1\Vendor\VendorOrderController;

// Admin Controllers
use App\Http\Controllers\Api\V1\Admin\DashboardController as AdminDashboardController;
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
use App\Http\Controllers\Api\V1\Admin\LayawayController as AdminLayawayController;
use App\Http\Controllers\Api\V1\Admin\AdminStoreController;
use App\Http\Controllers\Api\V1\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\V1\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Api\V1\Admin\BannerCampaignController as AdminBannerCampaignController;
use App\Http\Controllers\Api\V1\Admin\PromoPopupController as AdminPromoPopupController;
use App\Http\Controllers\Api\V1\PromoPopupController;

Route::prefix('v1')->group(function () {
    
    // ─── PUBLIC ROUTES ────────────────────────────────────────────────────────
    
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/register/verify', [AuthController::class, 'verifyRegistration']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/verify-2fa', [AuthController::class, 'verify2Fa']);
    
    // Google Authentication
    Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
    Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

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
    // Register my-store BEFORE {slug} so it's matched first (not intercepted by slug pattern)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/stores/my-store', [StoreController::class, 'myStore']);
        Route::post('/stores/my-store/update', [StoreController::class, 'update']);
        Route::post('/stores/apply', [StoreController::class, 'apply']);
        
        Route::get('/services/my-profile', [\App\Http\Controllers\Api\V1\ServiceProfileController::class, 'myProfile']);
        Route::post('/services/my-profile', [\App\Http\Controllers\Api\V1\ServiceProfileController::class, 'update']);
    });
    Route::get('/stores/{slug}', [StoreController::class, 'show']);

    Route::get('/services/categories', [\App\Http\Controllers\Api\V1\ServiceProfileController::class, 'categories']);
    Route::get('/services', [\App\Http\Controllers\Api\V1\ServiceProfileController::class, 'index']);
    Route::get('/services/{slug}', [\App\Http\Controllers\Api\V1\ServiceProfileController::class, 'show']);

    Route::get('/banners', [BannerController::class, 'index']);
    Route::get('/promo-popups/active', [PromoPopupController::class, 'active']);

    Route::get('/raffles', [RaffleController::class, 'index']);
    Route::get('/raffles/winners', [RaffleController::class, 'winners']);
    Route::get('/raffles/{uuid}', [RaffleController::class, 'show'])->whereUuid('uuid');

    // Webhooks
    Route::post('/payments/webhook/{gateway}', [PaymentController::class, 'webhook']);

    // AI Chat — public (no auth required so guests can also use it)
    Route::post('/ai/chat', [AiChatController::class, 'chat'])->middleware('throttle:30,1');

    // Marketing (Public)
    Route::get('/marketing/campaigns/active', [MarketingController::class, 'activeCampaigns']);
    Route::get('/marketing/flash-sales/active', [MarketingController::class, 'activeFlashSales']);
    Route::get('/marketing/collections', [MarketingController::class, 'collections']);

    // Analytics — public (no auth so guest installs are tracked too)
    Route::post('/analytics/app-installs', [\App\Http\Controllers\Api\V1\AnalyticsController::class, 'recordInstall'])->middleware('throttle:60,1');

    // ─── AUTHENTICATED ROUTES ─────────────────────────────────────────────────
    
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth / User Profile
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/submit-student-verification', [AuthController::class, 'submitStudentVerification']);

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
        Route::post('/sell-requests/{uuid}/accept-offer', [SellRequestController::class, 'acceptOffer']);
        Route::post('/sell-requests/{uuid}/reject-offer', [SellRequestController::class, 'rejectOffer']);
        
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
        Route::get('/layaways/settings/terms', [LayawayController::class, 'terms']);

        // Pre-Orders
        Route::get('/pre-orders', [\App\Http\Controllers\Api\V1\PreOrderController::class, 'index']);
        Route::post('/pre-orders', [\App\Http\Controllers\Api\V1\PreOrderController::class, 'store']);

        // Raffles
        Route::get('/raffles/my-tickets', [RaffleController::class, 'myTickets']);

        // NOTE: /stores/apply, /stores/my-store, /stores/my-store/update
        // are now registered ABOVE the {slug} route with auth:sanctum middleware.

        // Vendor Routes (requires active store and vendor role)
        Route::prefix('vendor')->middleware('role:vendor,admin,super_admin')->group(function () {
            Route::get('/dashboard', [VendorDashboardController::class, 'index']);
            Route::get('/products', [VendorProductController::class, 'index']);
            Route::post('/products', [VendorProductController::class, 'store']);
            Route::post('/products/{uuid}', [VendorProductController::class, 'update']);
            Route::delete('/products/{uuid}', [VendorProductController::class, 'destroy']);
            Route::get('/orders', [VendorOrderController::class, 'index']);
            Route::get('/orders/{uuid}', [VendorOrderController::class, 'show']);
            Route::post('/orders/{uuid}/status', [VendorOrderController::class, 'updateStatus']);
            
            // Wallet & Payouts
            Route::get('/wallet', [\App\Http\Controllers\Api\V1\Vendor\VendorWalletController::class, 'index']);
            Route::get('/wallet/transactions', [\App\Http\Controllers\Api\V1\Vendor\VendorWalletController::class, 'transactions']);
            Route::get('/payouts', [\App\Http\Controllers\Api\V1\Vendor\VendorWalletController::class, 'payouts']);
            Route::post('/payouts', [\App\Http\Controllers\Api\V1\Vendor\VendorWalletController::class, 'requestPayout']);
        });

        // ─── ADMIN ROUTES ─────────────────────────────────────────────────────────
        
        Route::prefix('admin')->middleware('role:admin,super_admin')->group(function () {
            // Dashboard Stats
            Route::get('/dashboard/comprehensive-stats', [AdminDashboardController::class, 'comprehensiveStats']);
            Route::get('/orders/stats', [AdminOrderController::class, 'stats']);
            Route::get('/analytics/app-installs', [\App\Http\Controllers\Api\V1\AnalyticsController::class, 'installStats']);

            // Users
            Route::get('/users/student-verifications/pending', [AdminUserController::class, 'pendingStudentVerifications']);
            Route::post('/users/{uuid}/approve-student-verification', [AdminUserController::class, 'approveStudentVerification']);
            Route::apiResource('users', AdminUserController::class)->only(['index', 'show', 'destroy']);
            Route::post('/users/{uuid}/toggle-status', [AdminUserController::class, 'toggleStatus']);
            Route::post('/users/{uuid}/role', [AdminUserController::class, 'updateRole']);

            // Admin OTP 2FA Verification
            Route::post('/otp/send', [AdminUserController::class, 'sendAdminOtp']);
            Route::post('/otp/verify', [AdminUserController::class, 'verifyAdminOtp']);

            // Service Categories
            Route::apiResource('service-categories', \App\Http\Controllers\Api\V1\Admin\ServiceCategoryController::class)->except(['show']);

            // Categories
            Route::apiResource('categories', AdminCategoryController::class);

            // Banners & Popups
            Route::apiResource('banner-campaigns', AdminBannerCampaignController::class)->except(['show']);
            Route::apiResource('banners', AdminBannerController::class)->except(['show']);
            Route::get('/promo-popups', [AdminPromoPopupController::class, 'index']);
            Route::post('/promo-popups', [AdminPromoPopupController::class, 'store']);
            Route::post('/promo-popups/{uuid}', [AdminPromoPopupController::class, 'update']);
            Route::delete('/promo-popups/{uuid}', [AdminPromoPopupController::class, 'destroy']);

            // Brands
            Route::apiResource('brands', \App\Http\Controllers\Api\V1\Admin\BrandController::class);

            // Products
            Route::apiResource('products', AdminProductController::class);

            // Orders
            Route::get('/orders', [AdminOrderController::class, 'index']);
            Route::get('/orders/{uuid}', [AdminOrderController::class, 'show']);
            Route::put('/orders/{uuid}/status', [AdminOrderController::class, 'updateStatus']);

            // Raffles (Admin)
            Route::get('/raffles/winners', [\App\Http\Controllers\Api\V1\Admin\RaffleController::class, 'winners']);
            Route::get('/raffles/{uuid}/tickets', [\App\Http\Controllers\Api\V1\Admin\RaffleController::class, 'tickets']);
            Route::post('/raffles/{uuid}/draw', [\App\Http\Controllers\Api\V1\Admin\RaffleController::class, 'draw']);
            Route::apiResource('raffles', \App\Http\Controllers\Api\V1\Admin\RaffleController::class)->except(['show']);

            // Sell Requests
            Route::get('/sell-requests', [AdminSellRequestController::class, 'index']);
            Route::get('/sell-requests/{uuid}', [AdminSellRequestController::class, 'show']);
            Route::post('/sell-requests/{uuid}/approve', [AdminSellRequestController::class, 'approve']);
            Route::post('/sell-requests/{uuid}/reject', [AdminSellRequestController::class, 'reject']);

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
            Route::get('/layaways/dashboard/stats', [AdminLayawayController::class, 'dashboard']);
            Route::get('/layaways/sales/history', [AdminLayawayController::class, 'sales']);
            Route::get('/layaways/inventory/products', [AdminLayawayController::class, 'inventory']);
            Route::post('/layaways/inventory/products/{uuid}/toggle', [AdminLayawayController::class, 'toggleInventory']);
            Route::get('/layaways', [AdminLayawayController::class, 'index']);
            Route::post('/layaways', [AdminLayawayController::class, 'store']);
            Route::get('/layaways/{uuid}', [AdminLayawayController::class, 'show']);
            Route::post('/layaways/{uuid}/payments', [AdminLayawayController::class, 'storePayment']);
            Route::post('/layaways/{uuid}/payments/{payment}/reverse', [AdminLayawayController::class, 'reversePayment']);

            // Pre-Orders (Admin)
            Route::get('/pre-orders', [\App\Http\Controllers\Api\V1\Admin\PreOrderController::class, 'index']);
            Route::post('/pre-orders/{uuid}/status', [\App\Http\Controllers\Api\V1\Admin\PreOrderController::class, 'updateStatus']);

            // Vendor Stores (Admin)
            Route::get('/stores', [AdminStoreController::class, 'index']);
            Route::post('/stores/{uuid}/approve', [AdminStoreController::class, 'approve']);
            Route::post('/stores/{uuid}/suspend', [AdminStoreController::class, 'suspend']);
            Route::post('/stores/{uuid}/restore', [AdminStoreController::class, 'restore']);
            Route::post('/stores/{uuid}/commission', [AdminStoreController::class, 'updateCommission']);
            Route::post('/stores/{uuid}/permissions', [AdminStoreController::class, 'updatePermissions']);

            // Payments (Admin)
            Route::get('/payments', [\App\Http\Controllers\Api\V1\PaymentController::class, 'adminIndex']);
            Route::post('/payments/{uuid}/confirm', [\App\Http\Controllers\Api\V1\PaymentController::class, 'adminConfirm']);

            // Admin Marketing
        Route::apiResource('marketing/campaigns', AdminCampaignController::class)->parameters(['campaigns' => 'uuid']);
        Route::post('marketing/campaigns/{uuid}', [AdminCampaignController::class, 'update']); // Use POST for FormData with _method=PUT later if needed, or stick to POST for file uploads
        Route::apiResource('marketing/flash-sales', AdminFlashSaleController::class)->parameters(['flash-sales' => 'uuid']);
        Route::apiResource('marketing/collections', AdminCollectionController::class)->parameters(['collections' => 'uuid']);

        // Settings
        Route::get('/settings/layaway-terms', [AdminSettingController::class, 'getLayawayTerms']);
        Route::post('/settings/layaway-terms', [AdminSettingController::class, 'updateLayawayTerms']);
    });
    });
});


