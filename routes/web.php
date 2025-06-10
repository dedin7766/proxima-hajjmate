<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function (){
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/products/{product}/barcode', [ProductController::class, 'generateBarcode'])
        ->name('products.barcode');

    Route::get('/products/{product}/barcode/download', [ProductController::class, 'downloadBarcode'])->name('products.barcode.download');

    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');

    Route::resource("users", UserController::class)
        ->only(["create", "store"])
        ->middleware("permission:users.create");

    Route::resource("users", UserController::class)
        ->only(["edit", "update"])
        ->middleware("permission:users.edit");

    Route::resource("users", UserController::class)
        ->only(["destroy"])
        ->middleware("permission:users.delete");

    Route::resource("users", UserController::class)
        ->only(["index", "show"])
        ->middleware("permission:users.view|users.create|users.edit|users.delete");

    // roles routes
    Route::resource("roles", RoleController::class)
        ->only(["create", "store"])
        ->middleware("permission:roles.create");

    Route::resource("roles", RoleController::class)
        ->only(["edit", "update"])
        ->middleware("permission:roles.edit");

    Route::resource("roles", RoleController::class)
        ->only(["destroy"])
        ->middleware("permission:roles.delete");

    Route::resource("roles", RoleController::class)
        ->only(["index", "show"])
        ->middleware("permission:roles.view|roles.create|roles.edit|roles.delete");

    Route::resource("products", ProductController::class);
    Route::resource('categories', CategoryController::class);

    Route::post('/transactions/cash', [TransactionController::class, 'storeCash'])->name('transactions.store.cash');
    Route::post('/transactions/midtrans', [TransactionController::class, 'storeMidtrans'])->name('transactions.store.midtrans');
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::resource('customers', CustomerController::class);
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');
    Route::get('/transactions/find/{invoice}', [\App\Http\Controllers\TransactionController::class, 'find'])
        ->name('transactions.find')
        ->middleware('auth'); // Pastikan hanya admin yang bisa akses

    // --- MOVE THESE ROUTES UP! ---
    Route::get('/invoices/print', [InvoiceController::class, 'printInvoices'])->name('invoices.print');
    Route::get('/invoices/download-pdf', [InvoiceController::class, 'downloadPdfInvoices'])->name('invoices.downloadPdf');
    // --- END MOVE ---

    Route::resource('invoices', InvoiceController::class)->middleware(['auth', 'verified']);

    // Rute khusus untuk menambah pembayaran pada invoice
    Route::post('/invoices/{invoice}/payments', [InvoiceController::class, 'storePayment'])
        ->name('invoices.payments.store')
        ->middleware(['auth', 'verified']);

    Route::post('/invoices/{invoice}/pay-with-midtrans', [InvoiceController::class, 'payWithMidtrans'])
        ->name('invoices.pay-with-midtrans')
        ->middleware(['auth', 'verified']);

    // These transaction routes are fine where they are, as their specific path is /transactions/print, etc.
    // and your transaction resource route for /transactions/{transaction} (if you have one)
    // would also need careful ordering.
    Route::get('/transactions/print', [TransactionController::class, 'printTransactions'])->name('transactions.print');
    Route::get('/transactions/download-pdf', [TransactionController::class, 'downloadPdfTransactions'])->name('transactions.downloadPdf');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';