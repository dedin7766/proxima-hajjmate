// src/components/pos/FindInvoiceModal.tsx

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { formatRupiah } from '@/lib/utils'; // Pastikan util ini sudah ada dan berfungsi dengan baik

interface FindInvoiceModalProps { // Nama interface diubah
    isOpen: boolean;
    onClose: () => void;
    findInvoiceInput: string; // Nama prop diubah
    setFindInvoiceInput: (value: string) => void; // Nama prop diubah
    onFindInvoice: () => void; // Nama prop diubah
    isFindingInvoice: boolean; // Nama prop diubah
    findInvoiceError: string | null; // Nama prop diubah
    foundInvoiceTransaction: any | null; // Nama prop diubah
    onReprint: (transaction: any) => void; // Untuk cetak ulang struk yang sudah ada
    onSelectFoundInvoiceTransaction: (transaction: any) => void; // Nama prop diubah
}

export default function FindInvoiceModal({ // Nama komponen diubah
    isOpen,
    onClose,
    findInvoiceInput,
    setFindInvoiceInput,
    onFindInvoice,
    isFindingInvoice,
    findInvoiceError,
    foundInvoiceTransaction,
    onReprint,
    onSelectFoundInvoiceTransaction,
}: FindInvoiceModalProps) { // Nama interface diubah

    const handleFind = (e: React.FormEvent) => { // Nama fungsi diubah
        e.preventDefault(); // Mencegah reload halaman
        onFindInvoice();
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                                <div>
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                        <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-5">
                                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                            Cari Transaksi Berdasarkan Nomor Invoice
                                        </Dialog.Title>
                                        <form onSubmit={handleFind} className="mt-4 flex gap-2"> {/* Nama fungsi diubah */}
                                            <input
                                                type="text"
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                placeholder="Masukkan nomor invoice..."
                                                value={findInvoiceInput} // Nama state diubah
                                                onChange={(e) => setFindInvoiceInput(e.target.value)} // Nama state diubah
                                                disabled={isFindingInvoice} // Nama state diubah
                                            />
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                                disabled={isFindingInvoice || findInvoiceInput.trim() === ''} // Nama state diubah
                                            >
                                                {isFindingInvoice ? 'Mencari...' : 'Cari'} {/* Nama state diubah */}
                                            </button>
                                        </form>

                                        {isFindingInvoice && ( // Nama state diubah
                                            <p className="mt-2 text-sm text-gray-500">Mencari transaksi...</p>
                                        )}

                                        {findInvoiceError && ( // Nama state diubah
                                            <p className="mt-2 text-sm text-red-600">{findInvoiceError}</p> // Nama state diubah
                                        )}

                                        {foundInvoiceTransaction && ( // Nama state diubah
                                            <div className="mt-4 p-4 border border-gray-200 rounded-md text-left">
                                                <h4 className="font-semibold text-lg text-gray-800">Transaksi Ditemukan!</h4>
                                                <p className="text-sm text-gray-600 mt-2">
                                                    No. Invoice: <span className="font-medium">{foundInvoiceTransaction.invoice_number}</span> {/* Nama state diubah */}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Tanggal: <span className="font-medium">{new Date(foundInvoiceTransaction.created_at).toLocaleString('id-ID')}</span> {/* Nama state diubah */}
                                                </p>
                                                {foundInvoiceTransaction.customer_name && ( // Nama state diubah
                                                    <p className="text-sm text-gray-600">
                                                        Pelanggan: <span className="font-medium">{foundInvoiceTransaction.customer_name}</span> {/* Nama state diubah */}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-600 font-bold">
                                                    Total: <span className="font-medium">Rp {formatRupiah(foundInvoiceTransaction.total_amount)}</span> {/* Nama state diubah */}
                                                </p>

                                                <div className="mt-4 flex gap-2 justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => onReprint(foundInvoiceTransaction)} // Nama state diubah
                                                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                    >
                                                        Cetak Ulang Struk
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onSelectFoundInvoiceTransaction(foundInvoiceTransaction)} // Panggil fungsi baru, nama state diubah
                                                        className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                    >
                                                        Pilih & Lanjutkan Transaksi
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                                        onClick={onClose}
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}