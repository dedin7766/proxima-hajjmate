<?php

// app/Http/Controllers/InvoiceController.php
namespace App\Http\Controllers;

// app/Http/Controllers/InvoiceController.php

// Pastikan untuk mengimpor Transaction dan DB
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Payment; // Import Payment model
// Import class Midtrans
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;
use Barryvdh\DomPDF\Facade\Pdf; // Import the PDF facade

class InvoiceController extends Controller
{

        public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'limit']);

        $invoices = $this->getFilteredInvoices($request);

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $filters, // Pass current filters back to frontend
        ]);
    }

    /**
     * Generate a printable view of invoices.
     */
    public function printInvoices(Request $request)
    {
        $invoices = $this->getFilteredInvoices($request, false); // Pass false to prevent pagination for print

        $pdf = Pdf::loadView('invoices.print', compact('invoices'));
        // Optional: Set paper size and orientation if needed
        $pdf->setPaper('A4', 'landscape');

        return $pdf->stream('invoices_report.pdf');
    }

    /**
     * Generate and download a PDF of invoices.
     */
    public function downloadPdfInvoices(Request $request)
    {
        $invoices = $this->getFilteredInvoices($request, false); // Pass false to prevent pagination for PDF

        $pdf = Pdf::loadView('invoices.pdf', compact('invoices'));
        // Optional: Set paper size and orientation if needed
        $pdf->setPaper('A4', 'landscape');

        return $pdf->download('invoices_report.pdf');
    }

    /**
     * Helper method to get filtered invoices.
     * @param Request $request
     * @param bool $paginate Whether to paginate the results.
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
     */
    protected function getFilteredInvoices(Request $request, bool $paginate = true)
    {
        $query = Invoice::query()->latest(); // Order by latest by default

        // Search filter by invoice_number or customer_name
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', '%' . $search . '%')
                  ->orWhere('customer_name', 'like', '%' . $search . '%');
            });
        }

        // Status filter
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $limit = $request->input('limit', 10); // Default limit is 10

        if ($paginate) {
            return $query->paginate($limit);
        }

        return $query->get(); // Return collection if not paginating (for print/PDF)
    }

    // app/Http/Controllers/InvoiceController.php

    public function show(Invoice $invoice)
    {
        return Inertia::render('Invoices/Show', [
            // Pastikan Anda me-load 'transactions' dan 'payments'
            'invoice' => $invoice->load(['payments' => function ($query) {
                $query->latest();
            }, 'transactions']), // <-- PASTIKAN 'transactions' ADA DI SINI
        ]);
    }

    public function create()
    {
        // Ambil semua transaksi yang belum di-invoice
        $pendingTransactions = Transaction::where('status', 'pending')->get();

        return Inertia::render('Invoices/Create', [
            'pendingTransactions' => $pendingTransactions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'issue_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:issue_date',
            'notes' => 'nullable|string',
            'transaction_ids' => 'required|array|min:1',
            'transaction_ids.*' => [
                'required',
                // Pastikan setiap ID ada di tabel transactions dan statusnya pending
                Rule::exists('transactions', 'id')->where(function ($query) {
                    $query->where('status', 'pending')->whereNull('invoice_id');
                }),
            ],
        ]);

        // Hitung total amount di backend untuk keamanan
        $totalAmount = Transaction::whereIn('id', $validated['transaction_ids'])->sum('total_amount');
        
        // Gunakan DB Transaction untuk memastikan semua proses berhasil atau gagal bersamaan
        $invoice = DB::transaction(function () use ($validated, $totalAmount) {
            // 1. Buat Invoice baru
            $newInvoice = Invoice::create([
                'customer_name' => $validated['customer_name'],
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'],
                'notes' => $validated['notes'],
                'total_amount' => $totalAmount,
                'invoice_number' => 'INV/' . now()->format('Ym') . '/' . (Invoice::count() + 1),
            ]);

            // 2. Update transaksi yang dipilih
            Transaction::whereIn('id', $validated['transaction_ids'])->update([
                'invoice_id' => $newInvoice->id,
                'status' => 'invoiced', // Ganti status menjadi 'invoiced' atau 'processed'
            ]);

            return $newInvoice;
        });
        
        return redirect()->route('invoices.show', $invoice->id)->with('message', 'Invoice created successfully from transactions.');
    }
    // Method baru untuk menyimpan pembayaran
    public function storePayment(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'payment_amount' => 'required|numeric|min:0.01|max:' . $invoice->remaining_balance,
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|max:50',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($invoice, $validated) {
            // 1. Catat pembayaran baru
            $invoice->payments()->create($validated);
            
            // 2. Update total yang sudah dibayar di invoice
            $invoice->increment('amount_paid', $validated['payment_amount']);

            // 3. Update status invoice jika lunas
            if ($invoice->fresh()->remaining_balance <= 0) {
                $invoice->status = 'PAID';

                // ========================================================
                // PERUBAHAN DI SINI: Update status transaksi terkait
                // ========================================================
                // Ubah status semua transaksi yang terikat ke invoice ini menjadi 'paid'.
                // Pastikan status 'paid' ada di enum kolom status tabel transaksi Anda.
                Transaction::where('invoice_id', $invoice->id)
                           ->update(['status' => 'paid']);
                // ========================================================

            } else {
                $invoice->status = 'PARTIALLY_PAID';
            }
            
            $invoice->save();
        });

        return redirect()->route('invoices.show', $invoice->id)->with('message', 'Payment added successfully.');
    }
    
 public function payWithMidtrans(Request $request, Invoice $invoice)
    {
        // 1. Validasi jumlah pembayaran
        $request->validate([
            'payment_amount' => 'required|numeric|min:1000|max:' . $invoice->fresh()->remaining_balance,
        ]);

        $snapToken = null;
        try {
            // 2. Gunakan database transaction untuk memastikan konsistensi data
            $snapToken = DB::transaction(function () use ($request, $invoice) {
                $paymentAmount = (int) $request->input('payment_amount'); // Midtrans expects integer

                // Set konfigurasi Midtrans
                Config::$serverKey = env('MIDTRANS_SERVER_KEY');
                Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
                Config::$isSanitized = true;
                Config::$is3ds = true;

                // Siapkan detail transaksi untuk Midtrans Snap
                $params = [
                    'transaction_details' => [
                        // Gunakan ID unik untuk order_id, yang mereferensikan invoice
                        'order_id'     => 'INV-PAY-' . $invoice->id . '-' . time() . '-' . uniqid(),
                        'gross_amount' => $paymentAmount,
                    ],
                    'customer_details' => [
                        'first_name' => $invoice->customer_name ?: 'Pelanggan Invoice', // Ambil nama pelanggan dari invoice
                        'email'      => auth()->user()->email ?? 'customer-' . $invoice->id . '@example.com', // Email user atau fallback
                    ],
                    'item_details' => [
                        [
                            'id'       => $invoice->id,
                            'price'    => $paymentAmount,
                            'quantity' => 1,
                            'name'     => 'Pembayaran Invoice ' . $invoice->invoice_number,
                            'category' => 'Invoice Payment',
                        ]
                    ],
                    'callbacks' => [
                        'finish'   => route('invoices.show', $invoice->id), // Redirect setelah pembayaran berhasil
                        'unfinish' => route('invoices.show', $invoice->id), // Redirect jika pembayaran belum selesai
                        'error'    => route('invoices.show', $invoice->id), // Redirect jika ada error pembayaran
                    ]
                ];

                // Dapatkan Snap Token dari Midtrans
                $token = Snap::getSnapToken($params);

                // Catat di database (opsional, tergantung kebutuhan).
                // Anda bisa menyimpan order_id Midtrans atau token di tabel 'payments'
                // atau di kolom 'midtrans_order_id' pada invoice jika ingin melacak ini.
                // Untuk contoh ini, kita akan menunggu notifikasi Midtrans untuk mencatat Payment.

                return $token;
            });

            // 3. Kirim Snap Token kembali ke frontend
            return response()->json(['snap_token' => $snapToken]);

        } catch (\Exception $e) {
            // 4. Tangani error dan kembalikan response JSON
            DB::rollBack(); // Pastikan transaksi dibatalkan jika ada error
            \Log::error("Midtrans Payment for Invoice Error: " . $e->getMessage());
            return response()->json(['message' => 'Gagal menginisiasi pembayaran Midtrans: ' . $e->getMessage()], 500);
        }
    }
    
}