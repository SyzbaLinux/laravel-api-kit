<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grade_ranges', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('grading_scale_id')->constrained('grading_scales')->cascadeOnDelete();
            $table->string('grade_letter');
            $table->decimal('min_mark', 5, 2);
            $table->decimal('max_mark', 5, 2);
            $table->string('descriptor')->nullable();
            $table->decimal('points', 4, 2)->nullable();
            $table->timestamps();

            $table->unique(['grading_scale_id', 'grade_letter']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grade_ranges');
    }
};
