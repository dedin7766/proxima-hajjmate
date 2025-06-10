<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_xx_xx_xxxxxx_add_invoice_id_to_transactions_table.php
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Tambahkan kolom invoice_id yang bisa null
            $table->foreignId('invoice_id')->nullable()->after('id')->constrained()->onDelete('set null');
            
            // Mungkin Anda juga ingin mengubah status transaksi. 
            // Pastikan kolom status di tabel transactions mendukung nilai baru seperti 'invoiced'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            //
        });
    }
};
