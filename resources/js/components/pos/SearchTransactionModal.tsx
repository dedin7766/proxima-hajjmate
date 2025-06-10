// src/components/pos/SearchTransactionModal.tsx

import React from 'react';
import { X, Loader2, ServerCrash, FileSearch } from 'lucide-react';
import { formatDisplayRupiah } from '@/lib/utils';

// ===============================================
// === INTERFACE DIPERBARUI DENGAN FIELD BARU ===
// ===============================================
interface FoundTransaction {
    id: number;
    invoice_number: string;
    customer_name: string | null;
    total_amount: number;      // Grand Total
    amount_paid: number;
    change: number;
    created_at: string;
    // Tambahkan field-field ini dari backend Anda
    subtotal: number;          // Total sebelum diskon/pajak
    discount_amount: number;   // Diskon keseluruhan transaksi
    tax_amount: number;        // Jumlah pajak
    details: {
        id: number;
        product: { name: string };
        quantity: number;
        price_at_transaction: number;
        subtotal: number;
        discount: number;
    }[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    searchInput: string;
    setSearchInput: (value: string) => void;
    onSearch: () => void;
    isSearching: boolean;
    searchError: string | null;
    foundTransaction: FoundTransaction | null;
    onReprint: (transaction: FoundTransaction) => void;
}

export default function SearchTransactionModal(props: Props) {
    const { isOpen, onClose, searchInput, setSearchInput, onSearch, isSearching, searchError, foundTransaction, onReprint } = props;

    if (!isOpen) return null;

    const handleSearchOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    // Kalkulasi total diskon dari semua item
    const totalItemDiscount = foundTransaction
        ? foundTransaction.details.reduce((acc, item) => acc + (item.discount || 0), 0)
        : 0;
    
    // Total semua diskon (item + keseluruhan)
    const totalOverallDiscount = totalItemDiscount + (foundTransaction?.discount_amount || 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-6 w-full max-w-2xl relative border flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                    <X size={24} />
                </button>
                <h3 className="text-xl font-semibold mb-4 text-center text-foreground">Detail Transaksi</h3>
                
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearchOnEnter}
                        placeholder="Masukkan No. Invoice (cth: INV-17...)"
                        className="w-full border bg-background rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
                        disabled={isSearching}
                    />
                    <button onClick={onSearch} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-semibold hover:bg-primary/90 disabled:bg-muted" disabled={isSearching || !searchInput}>
                        {isSearching ? <Loader2 className="animate-spin" /> : 'Cari'}
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto border-t pt-4 min-h-[250px]">
                    {isSearching && ( <div className="flex flex-col items-center justify-center h-full text-muted-foreground"><Loader2 size={40} className="animate-spin mb-4" /><p>Mencari...</p></div> )}
                    {searchError && ( <div className="flex flex-col items-center justify-center h-full text-destructive"><ServerCrash size={40} className="mb-4" /><p>{searchError}</p></div> )}
                    {!isSearching && !searchError && !foundTransaction && ( <div className="flex flex-col items-center justify-center h-full text-muted-foreground"><FileSearch size={40} className="mb-4" /><p>Masukkan nomor invoice untuk memulai pencarian.</p></div> )}
                    
                    {foundTransaction && (
                        <div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4 text-sm">
                                <div><strong>No. Invoice:</strong> {foundTransaction.invoice_number}</div>
                                <div><strong>Tgl. Transaksi:</strong> {new Date(foundTransaction.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                <div className="col-span-2"><strong>Pelanggan:</strong> {foundTransaction.customer_name || 'Umum'}</div>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="p-2 text-left">Produk</th>
                                        <th className="p-2 text-center w-16">Qty</th>
                                        <th className="p-2 text-right w-28">Harga</th>
                                        <th className="p-2 text-right w-32">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* ================================================= */}
                                    {/* === BAGIAN BARU: TAMPILKAN DISKON PER ITEM === */}
                                    {/* ================================================= */}
                                    {foundTransaction.details.map(item => (
                                        <React.Fragment key={item.id}>
                                            <tr className="border-b">
                                                <td className="p-2">{item.product.name}</td>
                                                <td className="p-2 text-center">{item.quantity}</td>
                                                <td className="p-2 text-right">{formatDisplayRupiah(item.price_at_transaction)}</td>
                                                <td className="p-2 text-right">{formatDisplayRupiah(item.price_at_transaction * item.quantity)}</td>
                                            </tr>
                                            {item.discount > 0 && (
                                                <tr className="border-b bg-muted/30">
                                                    <td colSpan={3} className="px-2 py-1 text-right text-xs text-muted-foreground">Diskon Item</td>
                                                    <td className="px-2 py-1 text-right text-xs text-destructive">-{formatDisplayRupiah(item.discount)}</td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                            
                            {/* ===================================================== */}
                            {/* === BAGIAN BARU: RINCIAN TOTAL YANG LEBIH LENGKAP === */}
                            {/* ===================================================== */}
                            <div className="mt-4 flex justify-end">
                                <div className="w-full max-w-sm space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatDisplayRupiah(foundTransaction.subtotal)}</span>
                                    </div>
                                    {totalOverallDiscount > 0 && (
                                        <div className="flex justify-between text-destructive">
                                            <span className="text-muted-foreground">Total Diskon</span>
                                            <span>-{formatDisplayRupiah(totalOverallDiscount)}</span>
                                        </div>
                                    )}
                                    {foundTransaction.tax_amount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">PPN</span>
                                            <span>{formatDisplayRupiah(foundTransaction.tax_amount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                                        <span>GRAND TOTAL</span>
                                        <span>{formatDisplayRupiah(foundTransaction.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 mt-2">
                                        <span className="text-muted-foreground">Dibayar</span>
                                        <span>{formatDisplayRupiah(foundTransaction.amount_paid)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Kembalian</span>
                                        <span>{formatDisplayRupiah(foundTransaction.change)}</span>
                                    </div>
                                </div>
                            </div>
                            
                             <div className="mt-6 text-center">
                                <button onClick={() => onReprint(foundTransaction)} className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700">
                                    Cetak
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}