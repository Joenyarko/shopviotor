<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('raffles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->string('title');
            $table->text('description');
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete(); // prize product
            $table->string('prize_description');
            $table->decimal('prize_value', 12, 2)->nullable();
            $table->decimal('ticket_price', 12, 2);
            $table->unsignedInteger('max_tickets')->nullable();
            $table->unsignedInteger('tickets_sold')->default(0);
            $table->string('status')->default('draft');
            $table->string('image')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('drawn_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->text('terms_conditions')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'ends_at']);
        });

        Schema::create('raffle_tickets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->foreignId('raffle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('ticket_number')->unique();
            $table->decimal('amount_paid', 12, 2);
            $table->string('payment_reference')->nullable();
            $table->boolean('is_winner')->default(false);
            $table->timestamps();

            $table->index(['raffle_id', 'user_id']);
            $table->index(['raffle_id', 'is_winner']);
        });

        Schema::create('raffle_winners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('raffle_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('raffle_ticket_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('verification_code')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->boolean('prize_collected')->default(false);
            $table->timestamp('prize_collected_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('raffle_winners');
        Schema::dropIfExists('raffle_tickets');
        Schema::dropIfExists('raffles');
    }
};
