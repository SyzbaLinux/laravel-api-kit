<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_cards', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users');
            $table->foreignId('school_class_id')->constrained('school_classes');
            $table->foreignId('academic_term_id')->constrained('academic_terms');
            $table->string('status')->default('draft');
            $table->decimal('total_marks', 6, 2)->nullable();
            $table->decimal('average', 5, 2)->nullable();
            $table->unsignedInteger('position')->nullable();
            $table->text('class_teacher_comment')->nullable();
            $table->string('promotion_status')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['student_id', 'academic_term_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_cards');
    }
};
