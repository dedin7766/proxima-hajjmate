<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'product_id',
        'quantity',
        'price_at_transaction',
        'discount', // Saya tambahkan 'discount' ke fillable sesuai kode controller
        'subtotal',
    ];

    /**
     * Mendapatkan transaksi induk.
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * =======================================================
     * TAMBAHKAN FUNGSI INI
     * Mendefinisikan bahwa sebuah detail transaksi 'milik' satu Produk.
     * =======================================================
     */
    public function product(): BelongsTo
    {
        // Pastikan model Product Anda ada di App\Models\Product
        return $this->belongsTo(Product::class);
    }
}