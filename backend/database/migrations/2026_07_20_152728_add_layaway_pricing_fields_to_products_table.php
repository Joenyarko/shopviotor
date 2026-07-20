<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('layaway_daily_amount', 12, 2)->nullable()->after('available_for_layaway');
            $table->decimal('layaway_weekly_amount', 12, 2)->nullable()->after('layaway_daily_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['layaway_daily_amount', 'layaway_weekly_amount']);
        });
    }
};
