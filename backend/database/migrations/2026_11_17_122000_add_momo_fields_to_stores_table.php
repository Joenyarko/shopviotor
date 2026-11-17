<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->string('momo_number')->nullable()->after('whatsapp');
            $table->string('momo_account_name')->nullable()->after('momo_number');
            $table->string('momo_network')->nullable()->after('momo_account_name'); // MTN, Telecel, AT
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn(['momo_number', 'momo_account_name', 'momo_network']);
        });
    }
};

