<?php

namespace App\Http\Controllers;

use App\Models\Transaction; // Pastikan Anda mengimpor model Transaction
use Illuminate\Http\Request;
use Midtrans\Config;
use Midtrans\Notification;

class MidtransController extends Controller
{
    /**
     * Handle Midtrans notification.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function webhook(Request $request)
    {
        // 1. Set konfigurasi Midtrans
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');

        // 2. Buat instance notifikasi Midtrans
        try {
            $notification = new Notification();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid notification object.'], 500);
        }
        
        // 3. Ambil order_id dan status transaksi dari payload
        $orderId = $notification->order_id;
        $transactionStatus = $notification->transaction_status;
        $fraudStatus = $notification->fraud_status;

        // 4. Cari transaksi di database Anda berdasarkan order_id (invoice_number)
        $transaction = Transaction::where('invoice_number', $orderId)->first();

        if (!$transaction) {
            return response()->json(['error' => 'Transaction not found.'], 404);
        }

        // 5. Lakukan verifikasi signature key (PENTING UNTUK KEAMANAN)
        $signatureKey = hash('sha512', $orderId . $notification->status_code . $notification->gross_amount . Config::$serverKey);
        if ($notification->signature_key != $signatureKey) {
            return response()->json(['error' => 'Invalid signature.'], 403);
        }

        // 6. Update status transaksi berdasarkan notifikasi
        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'accept') {
                // Transaksi berhasil untuk pembayaran kartu kredit
                $transaction->status = 'paid';
            }
        } else if ($transactionStatus == 'settlement') {
            // Transaksi berhasil untuk pembayaran selain kartu kredit (VA, GoPay, dll)
            $transaction->status = 'paid';
        } else if ($transactionStatus == 'pending') {
            // Status masih pending (tidak perlu diubah jika sudah pending)
            $transaction->status = 'pending';
        } else if ($transactionStatus == 'deny') {
            // Transaksi ditolak
            $transaction->status = 'failed';
        } else if ($transactionStatus == 'expire') {
            // Transaksi kadaluarsa
            $transaction->status = 'expired';
        } else if ($transactionStatus == 'cancel') {
            // Transaksi dibatalkan
            $transaction->status = 'failed';
        }

        $transaction->save();

        // Beri respons 200 OK ke Midtrans agar tidak mengirim notifikasi berulang kali
        return response()->json(['status' => 'ok']);
    }
}