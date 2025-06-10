<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Report (Print)</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        tfoot td {
            font-weight: bold;
            background-color: #e9e9e9; /* Slightly different background for footer */
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .capitalize {
            text-transform: capitalize;
        }
        /* Hide pagination links for print if any */
        .pagination {
            display: none;
        }
    </style>
</head>
<body>
    <h1>Invoice History Report</h1>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Invoice #</th>
                <th>Customer</th>
                <th class="text-right">Total</th>
                <th class="text-right">Remaining</th>
                <th class="text-center">Status</th>
                <th>Due Date</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($invoices as $index => $invoice)
                <tr>
                    {{-- Note: $invoices will be a Collection here, not a Paginator, so no firstItem() --}}
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $invoice->invoice_number }}</td>
                    <td>{{ $invoice->customer_name }}</td>
                    <td class="text-right">Rp{{ number_format($invoice->total_amount, 0, ',', '.') }}</td>
                    <td class="text-right">Rp{{ number_format($invoice->remaining_balance, 0, ',', '.') }}</td>
                    <td class="text-center capitalize">{{ str_replace('_', ' ', strtolower($invoice->status)) }}</td>
                    <td>{{ \Carbon\Carbon::parse($invoice->due_date)->locale('id')->isoFormat('D MMM Y') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center;">No invoices found.</td>
                </tr>
            @endforelse
        </tbody>
        {{-- --- NEW: Table Footer for Grand Totals --- --}}
        @if ($invoices->isNotEmpty())
            <tfoot>
                <tr>
                    <td colspan="3" class="text-right">Grand Total:</td>
                    <td class="text-right">
                        Rp{{ number_format($invoices->sum('total_amount'), 0, ',', '.') }}
                    </td>
                    <td class="text-right">
                        Rp{{ number_format($invoices->sum('remaining_balance'), 0, ',', '.') }}
                    </td>
                    <td colspan="2"></td> {{-- Span the remaining columns (Status, Due Date) --}}
                </tr>
            </tfoot>
        @endif
        {{-- --- END NEW --- --}}
    </table>
</body>
</html>