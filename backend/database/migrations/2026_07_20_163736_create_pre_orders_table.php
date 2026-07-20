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
        Schema::create('pre_orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            
            $table->decimal('total_price', 12, 2);
            $table->decimal('deposit_paid', 12, 2);
            $table->decimal('balance_remaining', 12, 2);
            
            $table->date('expected_date')->nullable();
            
            $table->string('status')->default('pending'); // pending, arrived, completed, cancelled
            
            $table->json('customer_details')->nullable(); // name, phone, address
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pre_orders');
    }
};
