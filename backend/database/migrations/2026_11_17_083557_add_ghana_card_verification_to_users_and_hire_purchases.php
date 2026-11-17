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
        Schema::table('users', function (Blueprint $table) {
            $table->string('applicant_type')->default('student')->after('student_verification_status'); // 'student' | 'general'
            $table->string('ghana_card_number')->nullable()->after('applicant_type');
            $table->string('ghana_card_front_url')->nullable()->after('ghana_card_number');
            $table->string('ghana_card_back_url')->nullable()->after('ghana_card_front_url');
            $table->string('selfie_url')->nullable()->after('ghana_card_back_url');
            $table->string('digital_address')->nullable()->after('selfie_url');
            $table->string('occupation')->nullable()->after('digital_address');
            $table->string('employer_name')->nullable()->after('occupation');
            $table->decimal('monthly_income', 12, 2)->nullable()->after('employer_name');
            $table->string('next_of_kin_name')->nullable()->after('monthly_income');
            $table->string('next_of_kin_phone')->nullable()->after('next_of_kin_name');
            $table->string('next_of_kin_relation')->nullable()->after('next_of_kin_phone');
            $table->string('identity_verification_status')->default('unverified')->after('next_of_kin_relation'); // 'unverified', 'pending', 'approved', 'rejected'
            $table->string('dojah_reference')->nullable()->after('identity_verification_status');
            $table->json('dojah_raw_response')->nullable()->after('dojah_reference');
        });

        Schema::table('hire_purchases', function (Blueprint $table) {
            $table->string('applicant_type')->default('student')->after('user_id');
            $table->string('ghana_card_number')->nullable()->after('applicant_type');
            $table->string('digital_address')->nullable()->after('ghana_card_number');
            $table->string('payment_method')->default('momo')->after('late_fee'); // 'momo' | 'paystack'
            $table->string('deposit_reference')->nullable()->after('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hire_purchases', function (Blueprint $table) {
            $table->dropColumn([
                'applicant_type',
                'ghana_card_number',
                'digital_address',
                'payment_method',
                'deposit_reference'
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'applicant_type',
                'ghana_card_number',
                'ghana_card_front_url',
                'ghana_card_back_url',
                'selfie_url',
                'digital_address',
                'occupation',
                'employer_name',
                'monthly_income',
                'next_of_kin_name',
                'next_of_kin_phone',
                'next_of_kin_relation',
                'identity_verification_status',
                'dojah_reference',
                'dojah_raw_response'
            ]);
        });
    }
};
