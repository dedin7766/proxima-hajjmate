import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import InputError from '@/components/input-error';
import { Printer } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';
import InvoicePrintLayout from './InvoicePrintLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import axios from 'axios';

// Fungsi helper
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const getStatusBadge = (status) => {
    switch (status) {
        case 'PAID':
            return <Badge variant="default">Paid</Badge>;
        case 'PARTIALLY_PAID':
            return <Badge variant="secondary">Partially Paid</Badge>;
        case 'UNPAID':
            return <Badge variant="destructive">Unpaid</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

function AddPaymentForm({ invoice }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        payment_amount: invoice.remaining_balance.toString(),
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Bank Transfer',
        notes: '',
    });

    const submit = async (e) => {
        e.preventDefault();

        if (data.payment_method === 'Midtrans') {
            try {
                // Panggil rute baru untuk inisiasi Midtrans
                const response = await axios.post(route('invoices.pay-with-midtrans', invoice.id), {
                    payment_amount: data.payment_amount, // Kirim jumlah yang ingin dibayar
                });
                const { snap_token } = response.data; // Pastikan namanya snap_token sesuai response backend

                if (snap_token) {
                    window.snap.pay(snap_token, {
                        onSuccess: function (result) {
                            alert("Pembayaran berhasil!");
                            // Setelah sukses, refresh halaman untuk update status invoice & payment history
                            window.location.reload();
                        },
                        onPending: function (result) {
                            alert("Pembayaran tertunda!");
                            window.location.reload();
                        },
                        onError: function (result) {
                            alert("Pembayaran gagal!");
                            window.location.reload();
                        },
                        onClose: function () {
                            alert('Anda menutup popup tanpa menyelesaikan pembayaran.');
                        }
                    });
                }
            } catch (error) {
                console.error("Error initiating Midtrans transaction:", error.response?.data || error.message);
                alert("Gagal menginisiasi pembayaran Midtrans. Coba lagi.");
            }
        } else {
            // Untuk Cash/Bank Transfer, lanjutkan dengan submit form biasa
            post(route('invoices.payments.store', invoice.id), {
                onSuccess: () => reset(),
                preserveScroll: true,
            });
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Add Payment</h2>
            <form onSubmit={submit} className="space-y-4 rounded-lg border p-4">
                <div>
                    <Label htmlFor="payment_amount">Amount to Pay</Label>
                    <Input
                        id="payment_amount"
                        type="number"
                        step="1000"
                        value={data.payment_amount}
                        onChange={(e) => setData('payment_amount', e.target.value)}
                        required
                        min="100000"
                        max={invoice.remaining_balance}
                    />
                    <InputError message={errors.payment_amount} className="mt-2" />
                </div>
                <div>
                    <Label htmlFor="payment_date">Payment Date</Label>
                    <Input id="payment_date" type="date" value={data.payment_date} onChange={(e) => setData('payment_date', e.target.value)} required />
                    <InputError message={errors.payment_date} className="mt-2" />
                </div>
                <div>
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <Select onValueChange={(value) => setData('payment_method', value)} value={data.payment_method}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Midtrans">Midtrans</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.payment_method} className="mt-2" />
                </div>
                {data.payment_method !== 'Midtrans' && ( // Hide notes for Midtrans as it's handled by the gateway
                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Input id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                        <InputError message={errors.notes} className="mt-2" />
                    </div>
                )}
                <div className="text-right">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : (data.payment_method === 'Midtrans' ? 'Pay with Midtrans' : 'Save Payment')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function Show({ auth, invoice }) {
    // ... (rest of your Show component remains the same)
    const handlePrint = () => {
        const printHtml = ReactDOMServer.renderToString(<InvoicePrintLayout invoice={invoice} />);
        const printContent = `
            <!DOCTYPE html><html><head><title>Invoice ${invoice.invoice_number}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); body { font-family: 'Inter', sans-serif; } @page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; } }</style>
            </head><body>${printHtml}</body></html>
        `;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    };

    return (
        <AppLayout user={auth.user}>
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="m-5 container mx-auto py-10">
                <div className="m-5 flex justify-end mb-4 gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak Invoice
                    </Button>
                </div>

                <div className="m-5 rounded-lg border p-6 shadow-sm mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold">{invoice.invoice_number} - {invoice.name}</h1>
                            <p className="text-muted-foreground">Customer: {invoice.customer_name}</p>
                        </div>
                        <div>{getStatusBadge(invoice.status)}</div>
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-2xl font-semibold">{formatCurrency(invoice.total_amount)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Amount Paid</p>
                            <p className="text-2xl font-semibold text-green-600">{formatCurrency(invoice.amount_paid)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Remaining Balance</p>
                            <p className="text-2xl font-semibold text-red-600">{formatCurrency(invoice.remaining_balance)}</p>
                        </div>
                    </div>
                </div>

                <div className="m-5 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
                        <div className="rounded-lg border shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.payments.length > 0 ? invoice.payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{new Date(payment.payment_date).toLocaleDateString('id-ID')}</TableCell>
                                            <TableCell>{formatCurrency(payment.payment_amount)}</TableCell>
                                            <TableCell>{payment.payment_method}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24">No payments found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {invoice.status !== 'PAID' && invoice.remaining_balance > 0 && (
                        <div>
                            <AddPaymentForm invoice={invoice} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}