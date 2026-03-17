<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subject_results', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users');
            $table->foreignId('subject_id')->constrained('subjects');
            $table->foreignId('school_class_id')->constrained('school_classes');
            $table->foreignId('academic_term_id')->constrained('academic_terms');
            $table->decimal('ca_score', 5, 2)->nullable();
            $table->decimal('exam_score', 5, 2)->nullable();
            $table->decimal('final_mark', 5, 2)->nullable();
            $table->string('grade_letter')->nullable();
            $table->decimal('points', 4, 2)->nullable();
            $table->text('teacher_comment')->nullable();
            $table->foreignId('teacher_id')->nullable()->constrained('users');
            $table->timestamps();

            $table->unique(['student_id', 'subject_id', 'academic_term_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subject_results');
    }
};
