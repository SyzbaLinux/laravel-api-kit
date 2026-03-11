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
        Schema::table('users', function (Blueprint $table): void {
            $table->foreignId('role_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->foreignId('school_id')->nullable()->after('role_id')->constrained()->nullOnDelete();
            $table->boolean('is_active')->default(true)->after('password');
            $table->string('phone')->nullable()->after('is_active');
            $table->string('avatar')->nullable()->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropForeign(['role_id']);
            $table->dropForeign(['school_id']);
            $table->dropColumn(['role_id', 'school_id', 'is_active', 'phone', 'avatar']);
        });
    }
};
