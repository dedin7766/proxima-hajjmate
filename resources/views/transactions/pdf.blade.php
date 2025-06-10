<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transactions Report (PDF)</title>
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
        h1 {
            text-align: center;
            margin-bottom: 30px;
        }
        .text-right {
            text-align: right;
        }
        .capitalize {
            text-transform: capitalize;
        }
    </style>
</head>
<body>
    <h1>Transaction History Report</h1>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Invoice</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Payment</th>
                <th>Status</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($transactions as $index => $transaction)
                <tr>
                    <td>{{ $transactions->firstItem() + $index }}</td>
                    <td>{{ $transaction->invoice_number }}</td>
                    <td>{{ \Carbon\Carbon::parse($transaction->created_at)->locale('id')->isoFormat('D MMM Y') }}</td>
                    <td>{{ $transaction->customer_name ?? 'N/A' }}</td>
                    <td>
                        @if ($transaction->details)
                            @foreach ($transaction->details as $detail)
                                <div>- {{ $detail->product->name }} ({{ $detail->quantity }}x)</div>
                            @endforeach
                        @endif
                    </td>
                    <td class="capitalize">{{ $transaction->payment_method }}</td>
                    <td class="capitalize">{{ $transaction->status }}</td>
                    <td class="text-right">
                        {{ number_format($transaction->total_amount, 0, ',', '.') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" style="text-align: center;">No transactions found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>