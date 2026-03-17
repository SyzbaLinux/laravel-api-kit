<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('title');
            $table->foreignId('assessment_type_id')->constrained('assessment_types');
            $table->foreignId('subject_id')->constrained('subjects');
            $table->foreignId('school_class_id')->constrained('school_classes');
            $table->foreignId('academic_term_id')->constrained('academic_terms');
            $table->decimal('max_score', 5, 2)->default(100);
            $table->date('date')->nullable();
            $table->foreignId('teacher_id')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
