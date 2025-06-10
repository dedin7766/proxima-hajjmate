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
        Schema::table('customers', function (Blueprint $table) {
            // Kolom NIK dan Nama sudah ada, kita tambahkan setelahnya
            $table->string('tempat_lahir')->nullable()->after('name');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->string('jenis_kelamin')->nullable()->after('tanggal_lahir');
            // Kolom Alamat sudah ada, kita tambahkan detailnya
            $table->string('rt', 3)->nullable()->after('address');
            $table->string('rw', 3)->nullable()->after('rt');
            $table->string('kel_desa')->nullable()->after('rw');
            $table->string('kecamatan')->nullable()->after('kel_desa');
            $table->string('agama')->nullable()->after('kecamatan');
            $table->string('status_perkawinan')->nullable()->after('agama');
            $table->string('pekerjaan')->nullable()->after('status_perkawinan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'tempat_lahir',
                'tanggal_lahir',
                'jenis_kelamin',
                'rt',
                'rw',
                'kel_desa',
                'kecamatan',
                'agama',
                'status_perkawinan',
                'pekerjaan',
            ]);
        });
    }
};