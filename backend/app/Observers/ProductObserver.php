<?php

namespace App\Observers;

use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class ProductObserver
{
    public function creating(Product $product): void
    {
        if (empty($product->uuid)) {
            $product->uuid = \Illuminate\Support\Str::uuid()->toString();
        }
    }

    public function saved(Product $product): void
    {
        $this->clearCaches($product);
    }

    public function deleted(Product $product): void
    {
        $this->clearCaches($product);
    }

    private function clearCaches(Product $product): void
    {
        Cache::forget("product:{$product->uuid}");
        Cache::forget("products:featured");
        Cache::forget("products:category:{$product->category_id}");
        Cache::tags(['products'])->flush();
    }
}
