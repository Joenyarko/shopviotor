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
            $table->dropColumn(['layaway_daily_amount', 'layaway_weekly_amount']);
            $table->integer('layaway_total_boxes')->nullable()->after('available_for_layaway');
            $table->decimal('layaway_box_price', 10, 2)->nullable()->after('layaway_total_boxes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['layaway_total_boxes', 'layaway_box_price']);
            $table->decimal('layaway_daily_amount', 10, 2)->nullable();
            $table->decimal('layaway_weekly_amount', 10, 2)->nullable();
        });
    }
};
