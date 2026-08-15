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
            $table->string('student_name')->nullable()->after('student_verification_status');
            $table->string('student_course')->nullable()->after('student_name');
            $table->string('student_level')->nullable()->after('student_course');
            $table->string('student_id_picture_url')->nullable()->after('student_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['student_name', 'student_course', 'student_level', 'student_id_picture_url']);
        });
    }
};
