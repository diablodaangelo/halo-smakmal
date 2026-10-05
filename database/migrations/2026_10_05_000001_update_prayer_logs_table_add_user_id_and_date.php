<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('prayer_logs', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->cascadeOnDelete();
            $table->date('date')->nullable()->after('user_id');
            $table->foreignId('daily_journal_id')->nullable()->change();
        });

        // Backfill existing rows if any
        $logs = DB::table('prayer_logs')->get();
        foreach ($logs as $log) {
            if ($log->daily_journal_id) {
                $journal = DB::table('daily_journals')->where('id', $log->daily_journal_id)->first();
                if ($journal) {
                    DB::table('prayer_logs')->where('id', $log->id)->update([
                        'user_id' => $journal->user_id,
                        'date' => $journal->date,
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prayer_logs', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'date']);
        });
    }
};
