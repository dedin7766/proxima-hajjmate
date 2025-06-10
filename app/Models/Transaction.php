<?php

// app/Models/Transaction.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    // Pastikan semua kolom yang diisi ada di sini
    protected $fillable = [
        'invoice_number',
        'customer_id',      // <-- TAMBAHKAN
        'customer_name',    // <-- TAMBAHKAN
        'total_amount',
        'amount_paid',
        'change',
        'payment_method',
        'status',
        'user_id',
        'midtrans_snap_token',
        'midtrans_payload',
    ];

    /**
     * Pastikan fungsi relasi ini ada.
     * Nama fungsi harus 'details' sesuai dengan yang dipanggil di controller.
     */
    public function details()
    {
        // Ganti TransactionDetail::class jika nama model detail Anda berbeda
        return $this->hasMany(TransactionDetail::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
