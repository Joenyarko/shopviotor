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
            $table->boolean('available_for_preorder')->default(false)->after('available_for_layaway');
            $table->decimal('preorder_deposit_amount', 12, 2)->nullable()->after('available_for_preorder');
            $table->date('preorder_expected_date')->nullable()->after('preorder_deposit_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'available_for_preorder',
                'preorder_deposit_amount',
                'preorder_expected_date'
            ]);
        });
    }
};
