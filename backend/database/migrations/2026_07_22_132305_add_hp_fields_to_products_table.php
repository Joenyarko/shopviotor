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
            $table->decimal('hp_interest_rate', 5, 2)->nullable()->comment('Custom HP interest rate (e.g. 5.00 for 5%)');
            $table->decimal('hp_min_deposit_percent', 5, 2)->nullable()->comment('Minimum deposit percentage (e.g. 20.00)');
            $table->integer('hp_max_duration_months')->nullable()->comment('Max months for HP plan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['hp_interest_rate', 'hp_min_deposit_percent', 'hp_max_duration_months']);
        });
    }
};
