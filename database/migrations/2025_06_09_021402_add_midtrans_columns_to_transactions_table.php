<?php
// database/migrations/xxxx_xx_xx_xxxxxx_add_midtrans_columns_to_transactions_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('status')->default('paid')->after('total_amount'); // 'paid', 'pending', 'failed', 'expired'
            $table->string('midtrans_snap_token')->nullable()->after('status');
            $table->json('midtrans_payload')->nullable()->after('midtrans_snap_token');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'status', 'midtrans_snap_token', 'midtrans_payload']);
        });
    }
};
