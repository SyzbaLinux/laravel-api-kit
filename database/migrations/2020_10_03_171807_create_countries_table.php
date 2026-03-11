<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table): void {
            $table->id();
            $table->string('iso', 2);
            $table->string('name', 80);
            $table->string('nicename', 80);
            $table->string('iso3', 3)->nullable();
            $table->smallInteger('numcode')->nullable();
            $table->integer('phonecode');
            $table->string('timezone')->nullable()->comment('Primary IANA timezone identifier');
            $table->json('timezones')->nullable()->comment('All IANA timezone identifiers for this country');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};
