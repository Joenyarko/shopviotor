<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hire_purchases', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('active');
            $table->decimal('product_price', 12, 2);
            $table->decimal('deposit_amount', 12, 2);
            $table->decimal('total_amount', 12, 2); // includes interest/fees
            $table->decimal('balance_remaining', 12, 2);
            $table->decimal('monthly_installment', 12, 2);
            $table->unsignedInteger('duration_months');
            $table->decimal('interest_rate', 5, 2)->default(0); // percentage per annum
            $table->decimal('late_fee', 10, 2)->default(0);
            $table->date('next_due_date')->nullable();
            $table->timestamp('deposit_paid_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('defaulted_at')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
        });

        Schema::create('hire_purchase_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hire_purchase_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('installment_number');
            $table->decimal('amount_due', 12, 2);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('late_fee', 10, 2)->default(0);
            $table->date('due_date');
            $table->timestamp('paid_at')->nullable();
            $table->string('status')->default('pending'); // pending, paid, overdue, partial
            $table->string('payment_reference')->nullable();
            $table->timestamps();

            $table->index(['hire_purchase_id', 'status']);
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hire_purchase_installments');
        Schema::dropIfExists('hire_purchases');
    }
};
