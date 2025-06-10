<?php

// app/Models/Payment.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'payment_amount',
        'payment_date',
        'payment_method',
        'notes',
    ];
    
    protected $casts = [
        'payment_date' => 'date',
        'payment_amount' => 'float',
    ];

    /**
     * Satu pembayaran milik satu invoice.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}