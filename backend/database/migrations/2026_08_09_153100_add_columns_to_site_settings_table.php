<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add missing columns to site_settings table so the Setting model works fully.
     * The original migration only had key/value; the model expects group, type, etc.
     */
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            if (!Schema::hasColumn('site_settings', 'group')) {
                $table->string('group')->default('general')->after('key');
            }
            if (!Schema::hasColumn('site_settings', 'type')) {
                $table->string('type')->default('string')->after('value');
            }
            if (!Schema::hasColumn('site_settings', 'label')) {
                $table->string('label')->nullable()->after('type');
            }
            if (!Schema::hasColumn('site_settings', 'description')) {
                $table->text('description')->nullable()->after('label');
            }
            if (!Schema::hasColumn('site_settings', 'is_public')) {
                $table->boolean('is_public')->default(false)->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn(['group', 'type', 'label', 'description', 'is_public']);
        });
    }
};
