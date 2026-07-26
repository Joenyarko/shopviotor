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
        Schema::table('stores', function (Blueprint $table) {
            $table->boolean('can_offer_layaway')->default(false)->after('status');
            $table->boolean('can_offer_hire_purchase')->default(false)->after('can_offer_layaway');
            $table->boolean('can_offer_preorders')->default(true)->after('can_offer_hire_purchase');
            $table->boolean('can_offer_trades')->default(false)->after('can_offer_preorders');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn([
                'can_offer_layaway',
                'can_offer_hire_purchase',
                'can_offer_preorders',
                'can_offer_trades',
            ]);
        });
    }
};
