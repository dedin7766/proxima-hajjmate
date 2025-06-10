import { ProductInTransaction } from '@/types';
import { X } from 'lucide-react';

interface TransactionItemsTableProps {
    items: ProductInTransaction[];
    onUpdateQty: (id: number, qty: number) => void;
    onUpdateItemDiscount: (id: number, discount: number) => void;
    onRemoveProduct: (id: number) => void;
}

export default function TransactionItemsTable({ items, onUpdateQty, onUpdateItemDiscount, onRemoveProduct }: TransactionItemsTableProps) {
    return (
        <div className="flex-grow overflow-y-auto -mx-4 sm:-mx-6 px-4 sm:px-6 border-t border-b">
            <table className="table-auto w-full">
                <thead className="sticky top-0 bg-muted z-10">
                    <tr>
                        <th className="p-3 text-left font-semibold text-sm text-muted-foreground">Produk</th>
                        <th className="p-3 text-center font-semibold text-sm text-muted-foreground w-24">Qty</th>
                        <th className="p-3 text-right font-semibold text-sm text-muted-foreground w-32">Harga</th>
                        <th className="p-3 text-right font-semibold text-sm text-muted-foreground w-32">Diskon (Rp)</th>
                        <th className="p-3 text-right font-semibold text-sm text-muted-foreground w-32">Subtotal</th>
                        <th className="p-3 text-center font-semibold text-sm text-muted-foreground w-20">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center p-8 text-muted-foreground">Keranjang masih kosong</td>
                        </tr>
                    ) : (
                        items.map((item) => (
                            <tr key={item.product_id} className="border-b">
                                <td className="p-3">{item.name}</td>
                                <td className="p-3 text-center">
                                    <input type="number" min={1} value={item.quantity} className="w-16 text-center border bg-background rounded-md py-1" onChange={(e) => onUpdateQty(item.product_id, Number(e.target.value))} onFocus={(e) => e.target.select()} />
                                </td>
                                <td className="p-3 text-right">Rp {item.price.toLocaleString()}</td>
                                <td className="p-3 text-right">
                                    <input type="number" min={0} placeholder='0' value={item.discount === 0 ? '' : item.discount} className="w-24 text-right border bg-background rounded-md py-1 px-2" onChange={(e) => onUpdateItemDiscount(item.product_id, Number(e.target.value))} onFocus={(e) => e.target.select()} />
                                </td>
                                <td className="p-3 text-right font-medium">Rp {item.subtotal.toLocaleString()}</td>
                                <td className="p-3 text-center">
                                    <button onClick={() => onRemoveProduct(item.product_id)} className="text-destructive hover:text-destructive/80 p-2"><X size={20} /></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}