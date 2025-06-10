// src/components/pos/TransactionPanel.tsx

import React from 'react';
import { Product, ProductInTransaction, Customer } from '@/types';
import CustomerSearch from './CustomerSearch';
import ProductSearch from './ProductSearch';
import CartTable from './CartTable';
import TotalsSummary from './TotalsSummary';

interface TransactionPanelProps {
    items: ProductInTransaction[];
    setItems: React.Dispatch<React.SetStateAction<ProductInTransaction[]>>;
    products: Product[];
    customers: Customer[];
    customerName: string;
    setCustomerName: (name: string) => void;
    setSelectedCustomerId: (id: number | null) => void;
    taxRate: string;
    setTaxRate: (rate: string) => void;
    discount: string;
    setDiscount: (amount: string) => void;
    addProductToTransaction: (product: Product) => void;
    total: number;
    totalOverallDiscount: number;
    tax: number;
    grandTotal: number;
}

export default function TransactionPanel({ items, setItems, products, customers, customerName, setCustomerName, setSelectedCustomerId, taxRate, setTaxRate, discount, setDiscount, addProductToTransaction, total, totalOverallDiscount, tax, grandTotal }: TransactionPanelProps) {
    const updateQty = (id: number, qty: number) => {
        setItems(prev => prev.map(i => {
            if (i.product_id === id) {
                const newQty = Math.max(1, qty);
                return { ...i, quantity: newQty, subtotal: (newQty * i.price) - i.discount };
            }
            return i;
        }).filter(item => item.quantity > 0));
    };

    const updateItemDiscount = (id: number, discountValue: number) => {
        setItems(prev => prev.map(i => {
            if (i.product_id === id) {
                const finalDiscount = Math.max(0, Math.min(discountValue, i.price * i.quantity));
                return { ...i, discount: finalDiscount, subtotal: (i.price * i.quantity) - finalDiscount };
            }
            return i;
        }));
    };

    const removeProduct = (id: number) => {
        setItems(prev => prev.filter(i => i.product_id !== id));
    };

    return (
        <div className="w-full lg:w-3/5 border rounded-xl p-4 sm:p-6 flex flex-col shadow-lg bg-card text-card-foreground">
            <h2 className="font-bold text-xl mb-4">Form Transaksi</h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <CustomerSearch customers={customers} customerName={customerName} setCustomerName={setCustomerName} setSelectedCustomerId={setSelectedCustomerId} />
                <ProductSearch products={products} onProductSelect={addProductToTransaction} />
            </div>
            <CartTable items={items} onUpdateQty={updateQty} onUpdateDiscount={updateItemDiscount} onRemove={removeProduct} />
            <TotalsSummary total={total} discount={discount} setDiscount={setDiscount} taxRate={taxRate} setTaxRate={setTaxRate} totalOverallDiscount={totalOverallDiscount} tax={tax} grandTotal={grandTotal} />
        </div>
    );
}