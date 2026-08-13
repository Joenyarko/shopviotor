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
        Schema::table('layaway_cards', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->change();
            $table->foreignId('layaway_plan_card_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('layaway_cards', function (Blueprint $table) {
            $table->dropForeign(['layaway_plan_card_id']);
            $table->dropColumn('layaway_plan_card_id');
            $table->foreignId('product_id')->nullable(false)->change();
        });
    }
};
