<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Kolom untuk customer terdaftar (foreign key)
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null')->after('user_id');

            // Kolom untuk customer yang diketik manual
            $table->string('customer_name')->nullable()->after('customer_id');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn(['customer_id', 'customer_name']);
        });
    }
};