<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;
use App\Models\Product;
use Inertia\Inertia;
// Import class Midtrans
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;
use Barryvdh\DomPDF\Facade\Pdf; // Import the PDF facade

class TransactionController extends Controller
{
    public function __construct()
    {
        Config::$serverKey    = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized  = config('midtrans.is_sanitized');
        Config::$is3ds        = config('midtrans.is_3ds');
    }

    public function index(Request $request)
    {
        // Get the limit from the request, default to 10 if not provided
        $limit = $request->input('limit', 10);

        $transactions = Transaction::query()
            // Use when() to apply filters conditionally
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%")
                      ->orWhere('customer_name', 'like', "%{$search}%");
                });
            })
            ->when($request->input('category'), function ($query, $categoryName) {
                // Filter based on relationship: find transactions that have products
                // with the matching category name.
                $query->whereHas('details.product.category', function ($q) use ($categoryName) {
                    $q->where('name', $categoryName);
                });
            })
            ->with(['details.product']) // Eager load relationships for efficiency
            ->latest() // Order by latest
            ->paginate($limit) // Apply the dynamic limit here
            ->withQueryString(); // Important: so pagination links include filter queries

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            // Send the list of categories to the frontend for the dropdown
            'categories' => Category::select('id', 'name')->get(),
            // Send back the current filter values, including 'limit'
            'filters' => $request->only(['search', 'category', 'limit']),
        ]);
    }


    /**
     * Menyimpan transaksi pembayaran tunai.
     */
    public function storeCash(Request $request)
    {
        // Validasi untuk pembayaran tunai
        $request->validate([
            'items'         => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'  => 'required|integer|min:1',
            'grandTotal'    => 'required|numeric',
            'paymentAmount' => 'required|numeric',
            'change'        => 'required|numeric',
            'customerName'  => 'nullable|string',
            'customer_id' => ['nullable', 'exists:customers,id'],
        ]);

        try {
            DB::transaction(function () use ($request) {
                // 1. Validasi stok sebelum proses apapun
                foreach ($request->items as $item) {
                    $product = Product::find($item['product_id']);
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stok untuk produk '{$product->name}' tidak mencukupi. Sisa stok: {$product->stock}");
                    }
                }

                // 2. Buat transaksi utama
                $transaction = Transaction::create([
                    'invoice_number' => 'TRX-' . time(),
                    'customer_name'  => $request->customerName,
                    'customer_id'  => $request->customer_id,
                    'total_amount'   => $request->grandTotal,
                    'amount_paid'    => $request->paymentAmount,
                    'change'         => $request->change,
                    'payment_method' => 'cash',
                    'status'         => 'paid', // Transaksi tunai langsung lunas
                    'user_id'        => auth()->id(),
                ]);

                // 3. Simpan item-item transaksi dan kurangi stok
                foreach ($request->items as $item) {
                    $transaction->details()->create([
                        'product_id'           => $item['product_id'],
                        'quantity'             => $item['quantity'],
                        'price_at_transaction' => $item['price'],
                        'discount'             => $item['discount'] ?? 0,
                        'subtotal'             => $item['subtotal'],
                    ]);

                    // Kurangi stok produk
                    Product::find($item['product_id'])->decrement('stock', $item['quantity']);
                }
            });

            // ================== PERBAIKAN UTAMA DI SINI ==================
            // Kembalikan response redirect yang dimengerti oleh Inertia.
            // Ini akan memicu callback 'onSuccess' di frontend.
            return redirect()->back()->with('success', 'Transaksi tunai berhasil disimpan!');
            // =============================================================

        } catch (\Exception $e) {
            // Jika ada error (termasuk stok), kembalikan ke halaman sebelumnya
            // dengan pesan error yang akan ditangkap oleh callback 'onError'.
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function storeMidtrans(Request $request)
    {
        // ... (validasi tidak berubah)
        $request->validate([
            'items'        => 'required|array|min:1',
            'grandTotal'   => 'required|numeric|min:1000',
            'customerName' => 'nullable|string',
            'customer_id' => ['nullable', 'exists:customers,id'],
        ]);
        
        $snapToken = null;
        try {
            $snapToken = DB::transaction(function () use ($request) {
                // ... (validasi stok tidak berubah)
                foreach ($request->items as $item) {
                    $product = Product::find($item['product_id']);
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stok untuk produk '{$product->name}' tidak mencukupi.");
                    }
                }

                $invoiceNumber = 'TRX-MT-' . time();
                $transaction = Transaction::create([
                    'invoice_number' => $invoiceNumber,
                    'customer_name'  => $request->customerName,
                    'customer_id'  => $request->customer_id,
                    'total_amount'   => $request->grandTotal,
                    'payment_method' => 'midtrans',
                    'status'         => 'pending',
                    'user_id'        => auth()->id(),
                ]);

                $midtransItems = [];
                foreach ($request->items as $item) {
                    $transaction->details()->create([
                        'product_id'           => $item['product_id'],
                        'quantity'             => $item['quantity'],
                        // ================== PERBAIKAN DI SINI ==================
                        'price_at_transaction' => $item['price'],
                        // =======================================================
                        'discount'             => $item['discount'] ?? 0,
                        'subtotal'             => $item['subtotal'],
                    ]);
                    
                    Product::find($item['product_id'])->decrement('stock', $item['quantity']);

                    $midtransItems[] = [
                        'id'       => $item['product_id'],
                        'price'    => $item['price'],
                        'quantity' => $item['quantity'],
                        'name'     => substr($item['name'], 0, 50),
                    ];
                }

                $params = [
                    'transaction_details' => [
                        'order_id'     => $invoiceNumber,
                        'gross_amount' => $request->grandTotal,
                    ],
                    'item_details' => $midtransItems,
                    'customer_details' => [
                        'first_name' => $request->customerName ?: 'Pelanggan',
                        'email'      => 'customer-' . time() . '@tokosaya.com',
                    ],
                ];

                $token = Snap::getSnapToken($params);

                $transaction->midtrans_snap_token = $token;
                $transaction->save();
                
                return $token;
            });
            
            return response()->json(['snap_token' => $snapToken]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function notificationHandler(Request $request)
    {
        // ... (Fungsi ini tidak perlu diubah)
        $notification = new Notification();
        $transactionStatus = $notification->transaction_status;
        $fraudStatus = $notification->fraud_status;
        $orderId = $notification->order_id;
        $transaction = Transaction::where('invoice_number', $orderId)->first();
        
        Log::info('Midtrans Notification Received: ', (array) $notification);

        if (!$transaction) {
            Log::error("Transaksi dengan invoice {$orderId} tidak ditemukan.");
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        if ($transaction->status !== 'pending') {
            Log::info("Transaksi {$orderId} sudah diproses, status saat ini: {$transaction->status}. Notifikasi diabaikan.");
            return response()->json(['message' => 'Notification already processed'], 200);
        }

        $signature = hash('sha512', $orderId . $notification->status_code . $notification->gross_amount . config('midtrans.server_key'));
        if ($signature !== $notification->signature_key) {
            Log::warning("Signature tidak valid untuk invoice {$orderId}.");
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
            if ($fraudStatus == 'accept') {
                $transaction->status = 'paid';
            }
        } else if ($transactionStatus == 'deny' || $transactionStatus == 'cancel' || $transactionStatus == 'expire') {
            $transaction->status = 'failed';
            foreach ($transaction->details as $detail) {
                Product::find($detail->product_id)->increment('stock', $detail->quantity);
                Log::info("Stok untuk produk ID {$detail->product_id} dikembalikan sebanyak {$detail->quantity}.");
            }
        }
        
        $transaction->midtrans_payload = json_encode($notification->getResponse());
        $transaction->save();
        
        return response()->json(['message' => 'Notification handled successfully'], 200);
    }

    public function find(string $invoice)
    {
        // Cari transaksi dengan detail item dan produk terkait
        $transaction = Transaction::where('invoice_number', $invoice)
            ->with('details', 'details.product') // Eager loading
            ->first();

        if ($transaction) {
            // Jika ditemukan, kembalikan data dalam format JSON
            return response()->json([
                'success' => true,
                'transaction' => $transaction,
            ]);
        } else {
            // Jika tidak ditemukan, kembalikan error 404
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan.',
            ], 404);
        }
    }

    public function printTransactions(Request $request)
    {
        $transactions = $this->getFilteredTransactions($request);

        // Load the view with the transactions data
        $pdf = Pdf::loadView('transactions.print', compact('transactions'));

        // Optional: Set paper size and orientation if needed
        $pdf->setPaper('A4', 'landscape');

        // Stream the PDF to the browser for printing
        return $pdf->stream('transactions_report.pdf');
    }

    public function downloadPdfTransactions(Request $request)
    {
        $transactions = $this->getFilteredTransactions($request);

        // Load the view with the transactions data
        $pdf = Pdf::loadView('transactions.pdf', compact('transactions'));

        // Optional: Set paper size and orientation if needed
        $pdf->setPaper('A4', 'landscape');

        // Download the PDF file
        return $pdf->download('transactions_report.pdf');
    }

    protected function getFilteredTransactions(Request $request)
    {
        $query = Transaction::query()
            ->with(['details.product']) // Eager load details and products
            ->latest(); // Order by latest by default, adjust as needed

        if ($request->has('search') && $request->input('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', '%' . $search . '%')
                    ->orWhere('customer_name', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('category') && $request->input('category')) {
            $category = $request->input('category');
            // Assuming your transactions have a relationship to categories through products or directly
            // You might need to adjust this based on your actual database schema
            $query->whereHas('details.product.category', function ($q) use ($category) {
                $q->where('name', $category);
            });
        }

        $limit = $request->input('limit', 10); // Default to 10 if not provided
        $transactions = $query->paginate($limit);

        return $transactions;
    }

}