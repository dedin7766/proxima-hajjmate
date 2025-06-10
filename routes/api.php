<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransactionController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rute standar Laravel untuk mendapatkan data user yang terautentikasi
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


// Rute untuk menerima notifikasi pembayaran dari Midtrans.
// Rute ini ditempatkan di sini karena webhook dari Midtrans tidak
// mengirimkan CSRF token yang diperlukan oleh rute web.
Route::post('/midtrans/notification', [TransactionController::class, 'notificationHandler'])->name('midtrans.notification');

