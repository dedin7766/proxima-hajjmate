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
        Schema::table('transactions', function (Blueprint $table) {
            // Mengubah kolom agar bisa bernilai NULL (kosong)
            $table->decimal('amount_paid', 15, 2)->nullable()->change();
            $table->decimal('change', 15, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Mengembalikan aturan seperti semula jika migrasi di-rollback
            $table->decimal('amount_paid', 15, 2)->nullable(false)->change();
            $table->decimal('change', 15, 2)->nullable(false)->change();
        });
    }
};