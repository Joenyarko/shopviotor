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
        Schema::create('store_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->decimal('available_balance', 10, 2)->default(0);
            $table->decimal('pending_balance', 10, 2)->default(0);
            $table->decimal('total_earned', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('store_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->nullableMorphs('reference'); // e.g., Order model
            $table->enum('type', ['credit', 'debit']); // credit (sale), debit (payout)
            $table->decimal('amount', 10, 2);
            $table->decimal('commission_amount', 10, 2)->default(0); // Admin's cut
            $table->string('description')->nullable();
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();
        });

        Schema::create('payout_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'approved', 'paid', 'rejected'])->default('pending');
            $table->string('payment_method'); // e.g., 'mobile_money', 'bank_transfer'
            $table->text('payment_details'); // e.g., "0241234567 - John Doe"
            $table->text('admin_notes')->nullable(); // Why it was rejected, etc.
            $table->timestamp('processed_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete(); // Admin who paid
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payout_requests');
        Schema::dropIfExists('store_transactions');
        Schema::dropIfExists('store_wallets');
    }
};
