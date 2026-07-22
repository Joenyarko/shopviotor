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
        Schema::create('layaway_payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('layaway_card_id')->constrained('layaway_cards')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->integer('boxes_covered');
            $table->string('payment_method'); // cash, paystack, momo, etc.
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->string('color_code')->nullable(); // UI color for tracker
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('layaway_payments');
    }
};
