<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Campaign;
use App\Models\FlashSale;
use App\Models\Collection;

class TestMarketingData extends Command
{
    protected $signature = 'test:marketing';
    protected $description = 'Create test marketing data';

    public function handle()
    {
        $this->info('Creating dummy marketing data...');

        // 1. Campaign
        Campaign::create([
            'title' => 'Summer Super Sale',
            'image_path' => 'https://via.placeholder.com/800x400?text=Summer+Super+Sale',
            'target_url' => '/products',
            'start_date' => now(),
            'end_date' => now()->addDays(7),
            'is_active' => true,
            'display_location' => 'homepage_popup',
        ]);
        $this->info('Campaign created.');

        // 2. Flash Sale
        FlashSale::create([
            'title' => 'Midnight Flash Sale',
            'image_path' => 'https://via.placeholder.com/800x200?text=Flash+Sale',
            'target_url' => '/flash-sales',
            'start_time' => now(),
            'end_time' => now()->addHours(12),
            'is_active' => true,
        ]);
        $this->info('Flash Sale created.');

        // 3. Collection
        Collection::create([
            'title' => 'New Arrivals 2026',
            'image_path' => 'https://via.placeholder.com/600x400?text=New+Arrivals',
            'target_url' => '/collections/new-arrivals',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $this->info('Collection created.');

        $this->info('All dummy data created successfully!');
    }
}
