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
            $table->enum('shipping_type', ['free', 'default', 'custom'])->default('default')->after('cost_price');
            $table->decimal('custom_shipping_fee', 10, 2)->nullable()->after('shipping_type');
        });

        Schema::create('user_product_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id')->nullable()->index(); // For guests
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete(); // Cache category to make queries fast
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_product_views');
        
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['shipping_type', 'custom_shipping_fee']);
        });
    }
};
