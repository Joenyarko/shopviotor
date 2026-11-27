<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'verification_attempts')) {
                $table->unsignedTinyInteger('verification_attempts')->default(0)->after('identity_verification_status');
            }
            if (!Schema::hasColumn('users', 'verification_rejection_reason')) {
                $table->text('verification_rejection_reason')->nullable()->after('verification_attempts');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'verification_rejection_reason')) {
                $table->dropColumn('verification_rejection_reason');
            }
            if (Schema::hasColumn('users', 'verification_attempts')) {
                $table->dropColumn('verification_attempts');
            }
        });
    }
};
