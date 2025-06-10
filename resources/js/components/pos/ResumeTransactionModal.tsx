import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { HeldTransaction } from '@/types'; // Pastikan tipe ini didefinisikan

interface ResumeTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: HeldTransaction[];
    onResume: (id: number) => void;
    onDelete: (id: number) => void;
}

export default function ResumeTransactionModal({ isOpen, onClose, transactions, onResume, onDelete }: ResumeTransactionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-6 w-full max-w-2xl relative border flex flex-col max-h-[80vh]">
                <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                    <X size={24} />
                </button>
                <h3 className="text-xl font-semibold mb-4 text-center text-foreground">Lanjutkan Transaksi Tertahan</h3>
                <div className="flex-grow overflow-y-auto -mx-6 px-6">
                    {transactions.length > 0 ? (
                        <ul className="space-y-3">
                            {transactions.map(trans => (
                                <li key={trans.id} className="border rounded-lg p-4 flex items-center justify-between gap-4 hover:bg-muted/50">
                                    <div className="flex-grow">
                                        <p className="font-semibold text-foreground">{trans.name}</p>
                                        <p className="text-sm text-muted-foreground">{trans.itemCount} item | Ditahan pada: {trans.heldAt}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => onResume(trans.id)} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/90">Lanjutkan</button>
                                        <button onClick={() => onDelete(trans.id)} className="bg-destructive text-white p-2 rounded-md hover:bg-destructive/90"><Trash2 size={18} /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-muted-foreground py-10">Tidak ada transaksi yang ditahan.</p>
                    )}
                </div>
            </div>
        </div>
    );
}