<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_enrollments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('academic_year_id')->nullable()->constrained('academic_years')->nullOnDelete();
            $table->date('enrolled_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'school_class_id', 'academic_year_id'], 'ce_student_class_year_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_enrollments');
    }
};
