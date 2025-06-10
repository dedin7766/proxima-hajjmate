// src/components/pos/PaymentSection.tsx

import React from 'react';
import { formatRupiah, parseRupiah } from '@/lib/utils';
import { ProductInTransaction } from '@/types';

interface PaymentSectionProps {
    items: ProductInTransaction[];
    isProcessing: boolean;
    isPaymentSufficient: boolean;
    grandTotal: number;
    change: number;
    paymentAmount: string;
    setPaymentAmount: (value: string) => void;
    setPaymentAmountRaw: (value: number) => void;
    onCashPayment: () => void;
    onMidtransPayment: () => void;
    onHold: () => void;
    onCancel: () => void;
}

export default function PaymentSection(props: PaymentSectionProps) {
    const { items, isProcessing, isPaymentSufficient, change, paymentAmount, setPaymentAmount, setPaymentAmountRaw, onCashPayment, onMidtransPayment, onHold, onCancel } = props;
    
    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentAmount(formatRupiah(e.target.value));
        setPaymentAmountRaw(parseRupiah(e.target.value));
    };

    return (
        <>
            <div className='border-t pt-4'>
                <h3 className="font-bold text-xl mb-4 text-card-foreground">Pembayaran</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="payment" className="block text-sm font-medium text-muted-foreground mb-1">Jumlah Bayar</label>
                        <input id="payment" type="text" placeholder="Rp 0" className="w-full border bg-background text-foreground rounded-md px-3 py-2 text-lg focus:ring-2 focus:ring-green-500" value={paymentAmount} onChange={handlePaymentChange} onFocus={(e) => e.target.select()} />
                        {items.length > 0 && !isPaymentSufficient && parseRupiah(paymentAmount) > 0 && (<p className="text-destructive text-sm mt-1">Maaf, nominal bayar kurang.</p>)}
                    </div>
                    <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                        <span className='font-medium text-lg text-muted-foreground'>Kembalian</span>
                        <span className='font-bold text-xl text-green-600'>{change > 0 && isPaymentSufficient ? formatRupiah(change) : 'Rp 0'}</span>
                    </div>
                </div>
            </div>
            <div className="mt-auto space-y-3 pt-6">
                <button onClick={onCashPayment} className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg hover:bg-primary/90 text-lg font-semibold transition-colors disabled:bg-muted disabled:cursor-not-allowed" disabled={items.length === 0 || !isPaymentSufficient || isProcessing}>{isProcessing ? 'Memproses...' : 'Bayar Tunai'}</button>
                <button onClick={onMidtransPayment} className="w-full bg-sky-600 text-white py-3.5 rounded-lg hover:bg-sky-700 text-lg font-semibold transition-colors disabled:bg-muted disabled:cursor-not-allowed" disabled={items.length === 0 || isProcessing}>{isProcessing ? 'Memproses...' : 'Bayar Online / QRIS'}</button>
                <div className='flex gap-3'>
                    <button onClick={onHold} className="w-full bg-yellow-500 text-white py-2.5 rounded-lg hover:bg-yellow-600 font-semibold transition-colors disabled:bg-muted disabled:cursor-not-allowed" disabled={items.length === 0}>Tahan</button>
                    <button onClick={onCancel} className="w-full bg-destructive text-white py-2.5 rounded-lg hover:bg-destructive/90 font-semibold transition-colors disabled:bg-muted disabled:cursor-not-allowed" disabled={items.length === 0}>Batal</button>
                </div>
            </div>
        </>
    );
}