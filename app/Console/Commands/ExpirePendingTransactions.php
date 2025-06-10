<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transaction;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class ExpirePendingTransactions extends Command
{
    /**
     * Nama dan signature dari console command.
     */
    protected $signature = 'transactions:expire';

    /**
     * Deskripsi console command.
     */
    protected $description = 'Expire pending transactions that are older than a specified time and restock products.';

    /**
     * Jalankan console command.
     */
    public function handle()
    {
        $this->info('Mulai memeriksa transaksi pending yang kedaluwarsa...');

        // Cari transaksi 'pending' yang dibuat lebih dari 60 menit yang lalu
        $expiredTransactions = Transaction::where('status', 'pending')
                                          ->where('payment_method', 'midtrans')
                                          ->where('created_at', '<', now()->subMinutes(60))
                                          ->get();

        if ($expiredTransactions->isEmpty()) {
            $this->info('Tidak ada transaksi pending yang perlu di-expire.');
            return;
        }

        foreach ($expiredTransactions as $transaction) {
            $transaction->status = 'expired';
            $transaction->save();

            // Kembalikan stok
            foreach ($transaction->details as $detail) {
                Product::find($detail->product_id)->increment('stock', $detail->quantity);
            }

            $logMessage = "Transaksi {$transaction->invoice_number} telah diubah menjadi 'expired' dan stok telah dikembalikan.";
            $this->info($logMessage);
            Log::info($logMessage);
        }

        $this->info('Proses pembersihan transaksi selesai.');
    }
}