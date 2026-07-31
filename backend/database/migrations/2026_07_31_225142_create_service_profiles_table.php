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
        Schema::create('service_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            $table->string('business_name');
            $table->string('slug')->unique();
            $table->text('bio')->nullable();
            $table->string('category')->index();
            
            $table->string('location')->nullable();
            $table->string('city')->nullable();
            $table->string('region')->nullable();
            
            $table->string('contact_number')->nullable();
            $table->string('whatsapp_number')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_profiles');
    }
};
