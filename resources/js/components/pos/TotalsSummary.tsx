import React from 'react';

interface TotalsSummaryProps {
    total: number;
    discount: string;
    setDiscount: (value: string) => void;
    taxRate: string;
    setTaxRate: (value: string) => void;
    totalOverallDiscount: number;
    tax: number;
    grandTotal: number;
}

export default function TotalsSummary({
    total,
    discount,
    setDiscount,
    taxRate,
    setTaxRate,
    totalOverallDiscount,
    tax,
    grandTotal,
}: TotalsSummaryProps) {
    return (
        <div className="mt-auto pt-4 space-y-2 text-md">
            <div className="flex justify-between">
                <span>Subtotal</span>
                <span className='font-medium'>Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
                <label htmlFor="discount" className="text-muted-foreground">Diskon (Rp)</label>
                <input id="discount" type="number" placeholder="0" className="w-32 text-right border bg-background rounded-md px-2 py-1" value={discount} onChange={(e) => setDiscount(e.target.value)} onFocus={(e) => e.target.select()} />
            </div>
            <div className="flex justify-between items-center">
                <label htmlFor="tax" className="text-muted-foreground">Pajak (%)</label>
                <input id="tax" type="number" placeholder="0" className="w-32 text-right border bg-background rounded-md px-2 py-1" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} onFocus={(e) => e.target.select()} />
            </div>
            <div className="border-t pt-2 mt-2 space-y-2">
                {totalOverallDiscount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Diskon</span>
                        <span className="font-medium text-destructive">- Rp {totalOverallDiscount.toLocaleString('id-ID')}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Pajak</span>
                    <span>Rp {tax.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
            <div className="flex justify-between font-bold text-2xl border-t-2 border-foreground pt-2 mt-2">
                <span>Grand Total</span>
                <span>Rp {grandTotal.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
            </div>
        </div>
    );
}