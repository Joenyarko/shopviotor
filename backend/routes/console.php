<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('raffles:process')->everyMinute();
Schedule::command('hp:check-overdue')->daily();

// Daily database backup at 2:00 AM server time
Schedule::command('db:backup')->dailyAt('02:00');

// Weekly: refresh MySQL query planner statistics for optimal index usage
Schedule::call(function () {
    $tables = ['products', 'orders', 'payments', 'users', 'store_transactions', 'layaway_cards'];
    foreach ($tables as $table) {
        try {
            \Illuminate\Support\Facades\DB::statement("ANALYZE TABLE `{$table}`");
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("ANALYZE TABLE failed for {$table}: " . $e->getMessage());
        }
    }
})->weekly()->sundays()->at('03:00')->name('analyze-tables')->withoutOverlapping();

