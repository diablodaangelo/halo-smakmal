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
        Schema::create('daily_journals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('attendance_id')->unique()->constrained('attendances')->cascadeOnDelete();
            $table->date('date');
            $table->text('work_summary');
            $table->text('obstacles')->nullable();
            $table->string('work_photo')->nullable();
            $table->enum('status', ['pending', 'approved', 'revision'])->default('pending');
            $table->text('mentor_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_journals');
    }
};
