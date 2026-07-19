<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trade_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete(); // the product they want from Viotor
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->decimal('product_value', 12, 2)->nullable(); // admin's value of customer's trade item
            $table->decimal('target_product_price', 12, 2)->nullable(); // price of product they want
            $table->decimal('difference', 12, 2)->nullable(); // amount customer must pay
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
        });

        Schema::create('trade_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trade_request_id')->constrained()->cascadeOnDelete();
            $table->string('item_name');
            $table->text('description');
            $table->string('condition'); // new, used, refurbished
            $table->json('images')->nullable();
            $table->decimal('estimated_value', 12, 2)->nullable();
            $table->decimal('admin_valued_at', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trade_items');
        Schema::dropIfExists('trade_requests');
    }
};
