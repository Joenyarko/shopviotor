<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds max_participants: the maximum number of UNIQUE user accounts
     * that may hold tickets for this raffle. Once reached, no new users
     * can buy a ticket, but existing participants can still buy more (subject
     * to max_per_user).
     */
    public function up(): void
    {
        Schema::table('raffles', function (Blueprint $table) {
            $table->unsignedInteger('max_participants')->nullable()->after('max_tickets');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('raffles', function (Blueprint $table) {
            $table->dropColumn('max_participants');
        });
    }
};
