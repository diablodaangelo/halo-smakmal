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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->date('date');
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
            $table->decimal('check_in_lat', 10, 8)->nullable();
            $table->decimal('check_in_long', 11, 8)->nullable();
            $table->decimal('check_out_lat', 10, 8)->nullable();
            $table->decimal('check_out_long', 11, 8)->nullable();
            $table->string('selfie_path')->nullable();
            $table->enum('status', ['hadir', 'terlambat', 'izin', 'sakit', 'alpa'])->default('hadir');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
