<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('stores', 'paystack_subaccount_code')) {
            Schema::table('stores', function (Blueprint $table) {
                $table->string('paystack_subaccount_code', 100)->nullable()->after('payout_recipient_code');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('stores', 'paystack_subaccount_code')) {
            Schema::table('stores', function (Blueprint $table) {
                $table->dropColumn('paystack_subaccount_code');
            });
        }
    }
};
