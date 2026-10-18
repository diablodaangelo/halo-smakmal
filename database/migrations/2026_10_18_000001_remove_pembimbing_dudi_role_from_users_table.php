<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Convert any existing pembimbing_dudi if any (just in case)
        DB::table('users')->where('role', 'pembimbing_dudi')->update(['role' => 'guru_pembimbing']);

        // Update enum to only have admin, guru_pembimbing, siswa
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'guru_pembimbing', 'siswa') NOT NULL DEFAULT 'siswa'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'guru_pembimbing', 'pembimbing_dudi', 'siswa') NOT NULL DEFAULT 'siswa'");
    }
};
