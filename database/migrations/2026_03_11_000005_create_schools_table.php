<?php

declare(strict_types=1);

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
        Schema::create('schools', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->foreignId('city_id')->nullable()->constrained('cities')->nullOnDelete();
            $table->foreignId('state_id')->nullable()->constrained('states')->nullOnDelete();
            $table->foreignId('country_id')->nullable()->constrained('countries')->nullOnDelete();
            $table->string('logo')->nullable();
            $table->string('website')->nullable();
            $table->string('education_level')->default('combined');
            $table->string('status')->default('active');
            $table->foreignId('subscription_plan_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('max_students')->default(500);
            $table->integer('max_teachers')->default(50);
            $table->json('settings')->nullable();
            $table->date('established_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
