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
        Schema::table('raffles', function (Blueprint $table) {
            $table->string('category')->nullable()->after('description');
            $table->integer('max_per_user')->nullable()->after('max_tickets');
            $table->boolean('allow_multiple')->default(true)->after('max_per_user');
            $table->boolean('is_sponsored')->default(false)->after('allow_multiple');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('raffles', function (Blueprint $table) {
            $table->dropColumn(['category', 'max_per_user', 'allow_multiple', 'is_sponsored']);
        });
    }
};
