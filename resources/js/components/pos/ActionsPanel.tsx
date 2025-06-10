// src/components/pos/ActionsPanel.tsx

import React from 'react';
import { ScanBarcode, History, Search } from 'lucide-react'; 
import { ProductInTransaction } from '@/types';
import PaymentSection from './PaymentSection';

interface ActionsPanelProps {
    items: ProductInTransaction[];
    isProcessing: boolean;
    isPaymentSufficient: boolean;
    grandTotal: number;
    change: number;
    paymentAmount: string;
    heldTransactionsCount: number;
    setPaymentAmount: (value: string) => void;
    setPaymentAmountRaw: (value: number) => void;
    onScanClick: () => void;
    onResumeClick: () => void;
    onCashPayment: () => void;
    onMidtransPayment: () => void;
    onHold: () => void;
    onCancel: () => void;
    onSearchClick: () => void; // Tambahkan prop baru
}

export default function ActionsPanel(props: ActionsPanelProps) {
    return (
        <div className="w-full lg:w-2/5 border rounded-xl p-4 sm:p-6 flex flex-col shadow-lg bg-card">
            {/* Ubah grid menjadi 3 kolom */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <button onClick={props.onScanClick} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold transition-colors flex items-center justify-center gap-2 text-base">
                    <ScanBarcode size={18} /> Pindai
                </button>
                {/* TOMBOL BARU */}
                <button onClick={props.onSearchClick} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center justify-center gap-2 text-base">
                    <Search size={18} /> Cari
                </button>
                <button onClick={props.onResumeClick} className="relative w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-semibold transition-colors flex items-center justify-center gap-2 text-base">
                    <History size={18} /> Lanjutkan
                    {props.heldTransactionsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                            {props.heldTransactionsCount}
                        </span>
                    )}
                </button>
            </div>
            <PaymentSection {...props} />
        </div>
    );
}