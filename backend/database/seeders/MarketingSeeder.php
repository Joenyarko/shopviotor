<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Collection;
use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\Database\Seeder;

class MarketingSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create a Campaign (Popup)
        Campaign::firstOrCreate(
            ['title' => 'Welcome Back - Flash Deals!'],
            [
                'image_path' => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
                'target_url' => '/products',
                'start_date' => now()->subDay(),
                'end_date' => now()->addDays(7),
                'is_active' => true,
                'display_location' => 'homepage_popup',
            ]
        );

        // 2. Create a Flash Sale
        $flashSale = FlashSale::firstOrCreate(
            ['title' => 'Flash Sales - Discover our Top Daily Deals'],
            [
                'start_time' => now()->subHour(),
                'end_time' => now()->addHours(12),
                'is_active' => true,
            ]
        );

        $productsForFlash = Product::where('status', 'active')->inRandomOrder()->limit(4)->get();
        
        foreach ($productsForFlash as $product) {
            $flashPrice = $product->price * 0.7; // 30% off
            
            $flashSale->products()->syncWithoutDetaching([
                $product->id => [
                    'flash_price' => $flashPrice,
                    'stock_allocated' => 50,
                    'stock_sold' => rand(5, 45),
                ]
            ]);
        }

        // 3. Create Curated Collections
        $collection1 = Collection::firstOrCreate(
            ['title' => 'Top Tech Deals | Up to 50% Off'],
            [
                'description' => 'The best electronics and gadgets.',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        $techProducts = Product::where('status', 'active')->inRandomOrder()->limit(6)->get();
        $syncData1 = [];
        foreach ($techProducts as $index => $prod) {
            $syncData1[$prod->id] = ['sort_order' => $index];
        }
        $collection1->products()->syncWithoutDetaching($syncData1);

        $collection2 = Collection::firstOrCreate(
            ['title' => 'Fashion & Style | Clearout Sale'],
            [
                'description' => 'Upgrade your wardrobe today.',
                'sort_order' => 2,
                'is_active' => true,
            ]
        );

        $fashionProducts = Product::where('status', 'active')->inRandomOrder()->limit(6)->get();
        $syncData2 = [];
        foreach ($fashionProducts as $index => $prod) {
            $syncData2[$prod->id] = ['sort_order' => $index];
        }
        $collection2->products()->syncWithoutDetaching($syncData2);
    }
}
