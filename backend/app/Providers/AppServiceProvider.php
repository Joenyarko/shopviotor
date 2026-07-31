<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Observers\OrderObserver;
use App\Observers\ProductObserver;
use App\Observers\UserObserver;
use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Observers
        User::observe(UserObserver::class);
        Product::observe(ProductObserver::class);
        Order::observe(OrderObserver::class);

        // API Rate Limiting
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Manually register Cloudinary macro if package auto-discovery fails
        \Illuminate\Http\UploadedFile::macro('storeOnCloudinary', function ($folder = null) {
            $response = cloudinary()->uploadApi()->upload($this->getRealPath(), ['folder' => $folder]);
            
            // The Cloudinary package expects the macro to return an object with a getSecurePath() method.
            // We can wrap the response in the package's CloudinaryEngine or just return a mock class
            // that mimics the expected behavior for getSecurePath()
            return new class($response['secure_url']) {
                private $url;
                public function __construct($url) { $this->url = $url; }
                public function getSecurePath() { return $this->url; }
            };
        });
    }
}
