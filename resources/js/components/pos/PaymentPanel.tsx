import { History, ScanBarcode } from 'lucide-react';

// Helper Functions (jika tidak mau diletakkan di file terpisah)
const formatRupiah = (value: string | number): string => {
    const numberValue = Number(String(value).replace(/[^0-9]/g, ''));
    if (isNaN(numberValue) || numberValue === 0) return '';
    return `Rp ${numberValue.toLocaleString('id-ID')}`;
};

interface PaymentPanelProps {
    items: any[];
    isProcessing: boolean;
    isPaymentSufficient: boolean;
    paymentAmount: string;
    paymentAmountRaw: number;
    change: number;
    heldTransactionsCount: number;
    onPaymentAmountChange: (formatted: string, raw: number) => void;
    onCashPayment: () => void;
    onMidtransPayment: () => void;
    onHoldTransaction: () => void;
    onCancelTransaction: () => void;
    onOpenScanner: () => void;
    onOpenResumeModal: () => void;
}


export default function PaymentPanel({
    items, isProcessing, isPaymentSufficient, paymentAmount, paymentAmountRaw, change, heldTransactionsCount,
    onPaymentAmountChange, onCashPayment, onMidtransPayment, onHoldTransaction, onCancelTransaction,
    onOpenScanner, onOpenResumeModal
}: PaymentPanelProps) {

    const parseRupiah = (value: string): number => {
        return Number(String(value).replace(/[^0-9]/g, ''));
    };
    
    return (
        <div className="w-full lg:w-2/5 border rounded-xl p-4 sm:p-6 flex flex-col shadow-lg bg-card">
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button onClick={onOpenScanner} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 text-lg font-semibold transition-colors flex items-center justify-center gap-2" ><ScanBarcode size={20}/> Pindai</button>
                <button onClick={onOpenResumeModal} className="relative w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 text-lg font-semibold transition-colors flex items-center justify-center gap-2" ><History size={20}/> Lanjutkan{heldTransactionsCount > 0 && (<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{heldTransactionsCount}</span>)}</button>
            </div>
            <div className='border-t pt-4'>
                <h3 className="font-bold text-xl mb-4 text-card-foreground">Pembayaran</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="payment" className="block text-sm font-medium text-muted-foreground mb-1">Jumlah Bayar</label>
                        <input id="payment" type="text" placeholder="Rp 0" className="w-full border bg-background text-foreground rounded-md px-3 py-2 text-lg focus:ring-2 focus:ring-green-500" value={paymentAmount} onChange={(e) => onPaymentAmountChange(formatRupiah(e.target.value), parseRupiah(e.target.value))} onFocus={(e) => e.target.select()} />
                        {items.length > 0 && !isPaymentSufficient && paymentAmountRaw > 0 && (<p className="text-destructive text-sm mt-1">Maaf, nominal bayar kurang.</p>)}
                    </div>
                    <div className="flex justify-between items-center bg-muted p-3 rounded-md"><span className='font-medium text-lg text-muted-foreground'>Kembalian</span><span className='font-bold text-xl text-green-600'>{change > 0 && isPaymentSufficient ? formatRupiah(change) : 'Rp 0'}</span></div>
                </div>
            </div>
            <div className="mt-auto space-y-3 pt-6">
                <button onClick={onCashPayment} className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg hover:bg-primary/90 text-lg font-semibold transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed" disabled={items.length === 0 || !isPaymentSufficient || isProcessing}>{isProcessing ? 'Memproses...' : 'Bayar Tunai'}</button>
                <button onClick={onMidtransPayment} className="w-full bg-sky-600 text-white py-3.5 rounded-lg hover:bg-sky-700 text-lg font-semibold transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed" disabled={items.length === 0 || isProcessing}>{isProcessing ? 'Memproses...' : 'Bayar Online / QRIS'}</button>
                <div className='flex gap-3'>
                    <button onClick={onHoldTransaction} className="w-full bg-yellow-500 text-white py-2.5 rounded-lg hover:bg-yellow-600 font-semibold transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed" disabled={items.length === 0}>Tahan</button>
                    <button onClick={onCancelTransaction} className="w-full bg-destructive text-white py-2.5 rounded-lg hover:bg-destructive/90 font-semibold transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed" disabled={items.length === 0}>Batal</button>
                </div>
            </div> 
        </div>
    );
}