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
        Schema::table('collections', function (Blueprint $table) {
            $table->string('header_color')->default('yellow')->after('title');
        });

        Schema::table('flash_sales', function (Blueprint $table) {
            $table->string('header_color')->default('yellow')->after('title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('flash_sales', function (Blueprint $table) {
            $table->dropColumn('header_color');
        });

        Schema::table('collections', function (Blueprint $table) {
            $table->dropColumn('header_color');
        });
    }
};
