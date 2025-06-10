import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { useEffect, useMemo, useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { X as XIcon } from 'lucide-react';

// Fungsi untuk format mata uang
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

// Komponen ini menerima daftar transaksi pending dari controller
export default function Create({ auth, pendingTransactions }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
        transaction_ids: [], // State ini tetap sama, menyimpan ID yang dipilih
    });

    // State lokal untuk komponen pencarian
    const [searchTerm, setSearchTerm] = useState('');

    // Hitung total amount (logika ini tidak berubah)
    const totalAmount = useMemo(() => {
        return pendingTransactions
            .filter((tx) => data.transaction_ids.includes(tx.id))
            .reduce((sum, tx) => sum + parseFloat(tx.total_amount), 0);
    }, [data.transaction_ids, pendingTransactions]);

    // Ambil detail transaksi yang sudah dipilih
    const selectedTransactions = useMemo(() => {
        return pendingTransactions.filter((tx) => data.transaction_ids.includes(tx.id));
    }, [data.transaction_ids, pendingTransactions]);
    
    // Filter transaksi yang tersedia untuk dipilih (belum dipilih dan cocok dengan pencarian)
    const availableTransactions = useMemo(() => {
        return pendingTransactions.filter(tx => {
            // Sembunyikan jika sudah dipilih
            if (data.transaction_ids.includes(tx.id)) {
                return false;
            }
            // Tampilkan jika cocok dengan kata kunci pencarian
            const searchContent = `${tx.invoice_number} ${tx.customer_name}`.toLowerCase();
            return searchContent.includes(searchTerm.toLowerCase());
        });
    }, [searchTerm, data.transaction_ids, pendingTransactions]);

    // Fungsi untuk menambah transaksi ke daftar pilihan
    const handleSelect = (transactionId) => {
        setData('transaction_ids', [...data.transaction_ids, transactionId]);
        setSearchTerm(''); // Kosongkan input pencarian setelah memilih
    };

    // Fungsi untuk menghapus transaksi dari daftar pilihan
    const handleRemove = (transactionId) => {
        setData('transaction_ids', data.transaction_ids.filter((id) => id !== transactionId));
    };

    // Peningkatan UX: Isi nama customer secara otomatis (logika ini tetap berguna)
    useEffect(() => {
        if (selectedTransactions.length > 0 && !data.customer_name) {
            setData('customer_name', selectedTransactions[0].customer_name);
        } else if (selectedTransactions.length === 0) {
            setData('customer_name', '');
        }
    }, [selectedTransactions]);

    const submit = (e) => {
        e.preventDefault();
        post(route('invoices.store'));
    };

    return (
        <AppLayout user={auth.user}>
            <Head title="Create Invoice" />
            <div className="container mx-auto max-w-4xl py-10">
                <h1 className="text-2xl font-bold mb-6">Create New Invoice from Transactions</h1>

                <form onSubmit={submit} className="space-y-8">
                    {/* ===================================================================== */}
                    {/* BAGIAN BARU: PENCARIAN TRANSAKSI MULTI-SELECT                     */}
                    {/* ===================================================================== */}
                    <div>
                        <Label className="text-lg font-semibold">Search and Select Transactions</Label>
                        <InputError message={errors.transaction_ids} className="mt-1" />
                        <Command className="mt-2 rounded-lg border">
                            {/* Area untuk menampilkan Badge/Tag transaksi yang dipilih */}
                            {selectedTransactions.length > 0 && (
                                <div className="p-2 flex flex-wrap gap-2 border-b">
                                    {selectedTransactions.map(tx => (
                                        <Badge key={tx.id} variant="secondary" className="flex items-center gap-2">
                                            <span>{tx.invoice_number} ({formatCurrency(tx.total_amount)})</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(tx.id)}
                                                className="rounded-full hover:bg-destructive/20 p-0.5"
                                            >
                                                <XIcon className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            <CommandInput
                                placeholder="Search by transaction # or customer name..."
                                value={searchTerm}
                                onValueChange={setSearchTerm}
                            />
                            <CommandList>
                                <CommandEmpty>No results found.</CommandEmpty>
                                <CommandGroup>
                                    {availableTransactions.map((tx) => (
                                        <CommandItem
                                            key={tx.id}
                                            value={`${tx.invoice_number} ${tx.customer_name}`} // value untuk pencarian internal Command
                                            onSelect={() => handleSelect(tx.id)}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex justify-between w-full">
                                                <span>{tx.invoice_number} - {tx.customer_name}</span>
                                                <span className="text-muted-foreground">{formatCurrency(tx.total_amount)}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </div>

                    {/* Bagian Form Detail Invoice (tetap sama) */}
                    <div className="space-y-6 rounded-lg border p-6 shadow-sm">
                        <div className="text-lg font-semibold border-b pb-2">Invoice Details</div>
                        <div>
                            <Label htmlFor="customer_name">Customer Name</Label>
                            <Input id="customer_name" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} />
                            <InputError message={errors.customer_name} className="mt-2" />
                        </div>
                        <div>
                            <Label htmlFor="total_amount">Total Amount</Label>
                            <Input
                                id="total_amount"
                                type="text"
                                readOnly
                                value={formatCurrency(totalAmount)}
                                className="font-bold bg-muted"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="issue_date">Issue Date</Label>
                                <Input id="issue_date" type="date" value={data.issue_date} onChange={(e) => setData('issue_date', e.target.value)} />
                                <InputError message={errors.issue_date} className="mt-2" />
                            </div>
                            <div>
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input id="due_date" type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                                <InputError message={errors.due_date} className="mt-2" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                            <InputError message={errors.notes} className="mt-2" />
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <Button type="submit" disabled={processing || data.transaction_ids.length === 0}>
                            {processing ? 'Saving...' : 'Create Invoice'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}