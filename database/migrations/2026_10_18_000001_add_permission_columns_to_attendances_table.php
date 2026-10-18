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
        Schema::table('attendances', function (Blueprint $table) {
            $table->text('permission_reason')->nullable()->after('status');
            $table->string('permission_doc')->nullable()->after('permission_reason');
            $table->boolean('is_approved')->nullable()->default(true)->after('permission_doc');
            $table->foreignId('approved_by')->nullable()->after('is_approved')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn([
                'permission_reason',
                'permission_doc',
                'is_approved',
                'approved_by',
                'approved_at',
            ]);
        });
    }
};
