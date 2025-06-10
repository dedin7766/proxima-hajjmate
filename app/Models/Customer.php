<?php

// app/Models/Customer.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'nik',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'address',
        'rt',
        'rw',
        'kel_desa',
        'kecamatan',
        'agama',
        'status_perkawinan',
        'pekerjaan',
        'phone',
        'ktp_image_path', // <-- Sesuaikan dengan nama kolom ini
    ];

    
}