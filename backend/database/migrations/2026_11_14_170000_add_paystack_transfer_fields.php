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
        Schema::table('payout_requests', function (Blueprint $table) {
            $table->string('recipient_code')->nullable()->after('payment_details');
            $table->string('transfer_code')->nullable()->after('recipient_code');
            $table->string('transfer_reference')->nullable()->after('transfer_code');
            $table->string('transfer_status')->nullable()->after('transfer_reference');
            $table->string('disbursed_via')->default('manual')->after('transfer_status'); // 'manual' | 'paystack'
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->string('payout_bank_code')->nullable()->after('commission_rate');
            $table->string('payout_bank_name')->nullable()->after('payout_bank_code');
            $table->string('payout_account_number')->nullable()->after('payout_bank_name');
            $table->string('payout_account_name')->nullable()->after('payout_account_number');
            $table->string('payout_recipient_code')->nullable()->after('payout_account_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payout_requests', function (Blueprint $table) {
            $table->dropColumn([
                'recipient_code',
                'transfer_code',
                'transfer_reference',
                'transfer_status',
                'disbursed_via',
            ]);
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn([
                'payout_bank_code',
                'payout_bank_name',
                'payout_account_number',
                'payout_account_name',
                'payout_recipient_code',
            ]);
        });
    }
};

