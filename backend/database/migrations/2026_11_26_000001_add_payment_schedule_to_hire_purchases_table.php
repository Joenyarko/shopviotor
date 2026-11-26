<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('hire_purchases', 'payment_schedule')) {
            Schema::table('hire_purchases', function (Blueprint $table) {
                $table->string('payment_schedule', 20)->default('monthly')->after('duration_months');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('hire_purchases', 'payment_schedule')) {
            Schema::table('hire_purchases', function (Blueprint $table) {
                $table->dropColumn('payment_schedule');
            });
        }
    }
};
