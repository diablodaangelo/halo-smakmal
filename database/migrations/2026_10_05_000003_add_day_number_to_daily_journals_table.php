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
        Schema::table('daily_journals', function (Blueprint $table) {
            if (!Schema::hasColumn('daily_journals', 'day_number')) {
                $table->unsignedInteger('day_number')->nullable()->after('user_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_journals', function (Blueprint $table) {
            if (Schema::hasColumn('daily_journals', 'day_number')) {
                $table->dropColumn('day_number');
            }
        });
    }
};
