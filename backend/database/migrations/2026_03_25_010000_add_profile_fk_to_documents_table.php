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
        if (!Schema::hasTable('documents') || !Schema::hasTable('profiles')) {
            return;
        }

        $constraintExists = DB::table('information_schema.TABLE_CONSTRAINTS')
            ->where('TABLE_SCHEMA', DB::raw('DATABASE()'))
            ->where('TABLE_NAME', 'documents')
            ->where('CONSTRAINT_NAME', 'documents_profile_id_foreign')
            ->exists();

        if ($constraintExists) {
            return;
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->foreign('profile_id')
                ->references('id')
                ->on('profiles')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('documents')) {
            return;
        }

        $constraintExists = DB::table('information_schema.TABLE_CONSTRAINTS')
            ->where('TABLE_SCHEMA', DB::raw('DATABASE()'))
            ->where('TABLE_NAME', 'documents')
            ->where('CONSTRAINT_NAME', 'documents_profile_id_foreign')
            ->exists();

        if (!$constraintExists) {
            return;
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign('documents_profile_id_foreign');
        });
    }
};
