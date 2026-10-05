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
        Schema::create('prayer_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_journal_id')->constrained('daily_journals')->cascadeOnDelete();
            $table->enum('prayer_type', ['dzuhur', 'ashar']);
            $table->time('prayer_time')->nullable();
            $table->string('location_name')->nullable();
            $table->enum('status', ['berjamaah', 'munfarid', 'udzur']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prayer_logs');
    }
};
