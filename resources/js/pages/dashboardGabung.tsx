import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import ProductCarousel, { Product } from '@/components/ProductCarousel';
import { useEffect, useRef, useState } from 'react';

import Webcam from 'react-webcam';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { X, Camera, Upload, ScanBarcode, Save, History, Trash2 } from 'lucide-react';

// Import axios untuk komunikasi API dengan backend
import axios from 'axios';

// Deklarasi global untuk window.snap agar TypeScript tidak error
declare global {
    interface Window {
        snap: any;
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Interface untuk data yang diterima dari backend
interface DashboardProps {
    products: Product[];
    customers: { id: number; name: string }[]; // Prop untuk daftar customer
    errors?: { [key: string]: string };
}

// Interface untuk item dalam keranjang
interface ProductInTransaction {
    product_id: number;
    name: string;
    quantity: number;
    price: number;
    discount: number;
    subtotal: number;
}

// Helper Function untuk Cetak Struk (tidak berubah)
const handlePrint = (transactionData: {
    items: ProductInTransaction[];
    total: number;
    discount: number;
    tax: number;
    grandTotal: number;
    customerName: string;
    paymentAmount: number;
    change: number;
}) => {
    const { items, total, discount, tax, grandTotal, customerName, paymentAmount, change } = transactionData;
    const transactionId = `INV-${Date.now()}`;
    const transactionDate = new Date().toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const totalItemDiscount = items.reduce((acc, item) => acc + (item.discount || 0), 0);
    const totalOverallDiscount = totalItemDiscount + discount;

    const receiptContent = `
      <html>
        <head>
          <title>Struk Pembelian</title>
          <style>
            body { font-family: 'Consolas', 'Menlo', 'Courier New', monospace; font-size: 9.5pt; width: 58mm; padding: 2.5mm; color: #000; }
            .header { text-align: center; margin-bottom: 10px; }
            .header h3 { margin: 0; font-size: 15pt; font-weight: bold; }
            .header p { margin: 1px 0; font-size: 8.5pt; }
            .info { margin-bottom: 10px; font-size: 9pt; }
            .info div { display: flex; justify-content: space-between; line-height: 1.4; }
            .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .items-table tr td[colspan="4"] { padding-top: 4px; text-align: left; font-size: 9pt; }
            .items-table .item-qty { text-align: left; padding-left: 8px; font-size: 8.5pt; }
            .items-table .item-price, .items-table .item-subtotal { text-align: right; font-size: 8.5pt; }
            .separator { border-top: 1px dashed #000; margin: 5px 0; }
            .totals { font-size: 9pt; }
            .totals div { display: flex; justify-content: space-between; margin-bottom: 3px; }
            .totals .grand-total { margin-top: 5px; padding-top: 5px; font-weight: bold; font-size: 10pt; }
            .footer { text-align: center; margin-top: 15px; font-size: 9pt; }
          </style>
        </head>
        <body>
          <div class="header"><h3>Angkasa Tour</h3><p>xxxxxxxx No. 123</p><p>Telepon: 0812-3456-7890</p></div>
          <div class="info">
            <div><span>No:</span> <span>${transactionId}</span></div>
            <div><span>Tanggal:</span> <span>${transactionDate}</span></div>
            <div><span>Admin:</span> <span>Elizabeth</span></div>
            ${customerName ? `<div><span>Pelanggan:</span> <span>${customerName}</span></div>` : ''}
          </div>
          <div class="separator"></div>
          <table class="items-table">
            ${items.map((item) => `
              <tr><td colspan="4">${item.name}</td></tr>
              <tr>
                <td></td>
                <td class="item-qty">${item.quantity} x</td>
                <td class="item-price">${item.price.toLocaleString('id-ID')}</td>
                <td class="item-subtotal">${(item.price * item.quantity).toLocaleString('id-ID')}</td>
              </tr>
              ${item.discount > 0 ? `
                <tr>
                  <td></td>
                  <td colspan="2" style="text-align: left; font-size: 8pt; padding-left: 10px;">Diskon</td>
                  <td class="item-subtotal" style="font-size: 8pt;">- ${item.discount.toLocaleString('id-ID')}</td>
                </tr>
              ` : ''}
            `).join('')}
          </table>
          <div class="separator"></div>
          <div class="totals">
            <div><span>Subtotal:</span> <span>Rp ${total.toLocaleString('id-ID')}</span></div>
            ${totalOverallDiscount > 0 ? `<div><span>Total Diskon:</span> <span>- Rp ${totalOverallDiscount.toLocaleString('id-ID')}</span></div>` : ''}
            <div><span>Pajak (PPN):</span> <span>Rp ${tax.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></div>
            <div class="separator"></div>
            <div class="grand-total"><span>TOTAL:</span> <span>Rp ${grandTotal.toLocaleString('id-ID')}</span></div>
            <div class="separator"></div>
            <div><span>Tunai:</span> <span>Rp ${paymentAmount.toLocaleString('id-ID')}</span></div>
            <div><span>Kembali:</span> <span>Rp ${change.toLocaleString('id-ID')}</span></div>
          </div>
          <div class="footer"><p>Terima kasih!</p></div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '', 'height=500,width=500');
    if (printWindow) {
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
};

// Helper Functions untuk Format Rupiah (tidak berubah)
const formatRupiah = (value: string | number): string => {
    const numberValue = Number(String(value).replace(/[^0-9]/g, ''));
    if (isNaN(numberValue) || numberValue === 0) return '';
    return `Rp ${numberValue.toLocaleString('id-ID')}`;
};
const parseRupiah = (value: string): number => {
    return Number(String(value).replace(/[^0-9]/g, ''));
};

// Kunci untuk LocalStorage
const LOCAL_STORAGE_KEY = 'posTransactionData';
const HELD_TRANSACTIONS_KEY = 'posHeldTransactions';

export default function Dashboard({ products, customers, errors }: DashboardProps) {
    // State untuk keranjang dan UI utama
    const [items, setItems] = useState<ProductInTransaction[]>(() => { try { const savedData = localStorage.getItem(LOCAL_STORAGE_KEY); if (savedData) { const parsedData = JSON.parse(savedData); return parsedData.items || []; } } catch (error) { console.error("Gagal memuat item keranjang dari localStorage:", error); } return []; });
    const [customerName, setCustomerName] = useState(() => { try { const savedData = localStorage.getItem(LOCAL_STORAGE_KEY); return savedData ? JSON.parse(savedData).customerName || '' : ''; } catch { return ''; } });
    const [taxRate, setTaxRate] = useState(() => { try { const savedData = localStorage.getItem(LOCAL_STORAGE_KEY); const rate = savedData ? JSON.parse(savedData).taxRate : '0'; return rate || '0'; } catch { return '0'; } });
    const [discount, setDiscount] = useState(() => { try { const savedData = localStorage.getItem(LOCAL_STORAGE_KEY); const disc = savedData ? JSON.parse(savedData).discount : '0'; return disc || '0'; } catch { return '0'; } });
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentAmountRaw, setPaymentAmountRaw] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // State untuk scanner
    const webcamRef = useRef<Webcam>(null);
    const codeReader = useRef<BrowserMultiFormatReader | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScannerModalOpen, setScannerModalOpen] = useState(false);
    const [isCameraActive, setCameraActive] = useState(false);

    // State untuk fitur Tahan/Lanjutkan Transaksi
    const [isResumeModalOpen, setResumeModalOpen] = useState(false);
    const [heldTransactions, setHeldTransactions] = useState<any[]>([]);

    // State untuk fitur pencarian customer
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [customerSearchResults, setCustomerSearchResults] = useState<{ id: number; name: string }[]>([]);
    const [isCustomerDropdownOpen, setCustomerDropdownOpen] = useState(false);

    // State untuk pencarian produk
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);

    // -- EFFECTS --
    // Memuat transaksi yang ditahan dari localStorage
    useEffect(() => {
        try {
            const savedHeld = localStorage.getItem(HELD_TRANSACTIONS_KEY);
            if (savedHeld) {
                setHeldTransactions(JSON.parse(savedHeld));
            }
        } catch (error) {
            console.error("Gagal memuat transaksi yang ditahan dari localStorage:", error);
            setHeldTransactions([]);
        }
    }, []);

    // Menyimpan data keranjang aktif ke localStorage
    useEffect(() => { try { const transactionData = { items, customerName, taxRate, discount, }; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactionData)); } catch (error) { console.error("Gagal menyimpan data transaksi ke localStorage:", error); } }, [items, customerName, taxRate, discount]);
    
    // Inisialisasi barcode reader
    useEffect(() => { codeReader.current = new BrowserMultiFormatReader(); }, []);
    
    // Mengaktifkan/menonaktifkan scanner
    useEffect(() => { if (isScannerModalOpen && isCameraActive) { startScanner(); } else { codeReader.current?.reset(); } return () => { codeReader.current?.reset(); }; }, [isScannerModalOpen, isCameraActive]);

    // Logika pencarian produk
    useEffect(() => { if (searchText.trim() === '') { setSearchResults([]); return; } const filtered = products.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()) && p.stock > 0 ); setSearchResults(filtered); }, [searchText, products]);

    // Logika pencarian customer
    useEffect(() => {
        if (customerName.trim() === '') {
            setCustomerSearchResults([]);
            setCustomerDropdownOpen(false);
            if (selectedCustomerId !== null) {
                setSelectedCustomerId(null);
            }
            return;
        }
        const filtered = customers.filter(c => 
            c.name.toLowerCase().includes(customerName.toLowerCase())
        );
        setCustomerSearchResults(filtered);
        setCustomerDropdownOpen(filtered.length > 0);
    }, [customerName, customers]);


    // -- FUNGSI-FUNGSI --
    // Fungsi untuk membatalkan semua input di form
    const handleCancelTransaction = () => {
        setItems([]);
        setDiscount('0');
        setTaxRate('0');
        setCustomerName('');
        setSelectedCustomerId(null); // Reset customer ID
        setPaymentAmount('');
        setPaymentAmountRaw(0);
        setSearchText('');
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch (error) {
            console.error("Gagal menghapus data dari localStorage:", error);
        }
    }

    // Fungsi-fungsi untuk scanner barcode
    const handleCloseScannerModal = () => { setScannerModalOpen(false); setCameraActive(false); setError(null); }
    const startScanner = () => { setError(null); if (!webcamRef.current || !webcamRef.current.video) { setTimeout(startScanner, 200); return; } const videoElement = webcamRef.current.video; codeReader.current?.decodeFromVideoDevice(undefined, videoElement, (result, err) => { if (result) { const scannedCode = result.getText(); handleScan(scannedCode); handleCloseScannerModal(); } if (err && !(err instanceof NotFoundException)) { setError('Gagal memindai barcode. Coba lagi.'); } }).catch((err) => setError('Kamera tidak ditemukan atau akses ditolak.')); };
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; setError(null); const imageUrl = URL.createObjectURL(file); try { const result = await codeReader.current?.decodeFromImageUrl(imageUrl); if (result) { handleScan(result.getText()); handleCloseScannerModal(); } else { setError('Tidak ada barcode yang terdeteksi pada gambar.'); } } catch (err) { if (err instanceof NotFoundException) { setError('Barcode tidak dapat ditemukan di dalam gambar.'); } else { setError('Gagal membaca barcode dari gambar.'); } } finally { URL.revokeObjectURL(imageUrl); if (fileInputRef.current) { fileInputRef.current.value = ''; } } };
    const handleScan = (barcode: string) => { const product = products.find((p) => String(p.sku) === barcode); if (!product) { alert('Produk tidak ditemukan!'); return; } addProductToTransaction(product); };

    // Fungsi-fungsi untuk manajemen keranjang
    const addProductToTransaction = (product: Product) => { setItems((prev) => { const exist = prev.find((i) => i.product_id === product.id); const productPrice = Number(product.price); if (exist) { return prev.map((i) => i.product_id === product.id ? { ...i, quantity: i.quantity + 1, subtotal: ((i.quantity + 1) * productPrice) - i.discount } : i ); } return [ ...prev, { product_id: product.id, name: product.name, quantity: 1, price: productPrice, discount: 0, subtotal: productPrice, }, ]; }); };
    const updateQty = (id: number, qty: number) => { setItems((prev) => prev.map((i) => { if (i.product_id === id) { const newQty = Math.max(1, qty); return { ...i, quantity: newQty, subtotal: (newQty * i.price) - i.discount }; } return i; }).filter(item => item.quantity > 0) ); };
    const updateItemDiscount = (id: number, discountValue: number) => { setItems(prev => prev.map(i => { if (i.product_id === id) { const newDiscount = Math.max(0, discountValue); const maxDiscount = i.price * i.quantity; const finalDiscount = Math.min(newDiscount, maxDiscount); return { ...i, discount: finalDiscount, subtotal: (i.price * i.quantity) - finalDiscount, }; } return i; }) ); };
    const removeProduct = (id: number) => { setItems((prev) => prev.filter((i) => i.product_id !== id)); };

    // Fungsi untuk memilih customer dari dropdown
    const handleSelectCustomer = (customer: { id: number; name:string }) => {
        setCustomerName(customer.name);
        setSelectedCustomerId(customer.id);
        setCustomerDropdownOpen(false);
        setCustomerSearchResults([]);
    };

    // Fungsi-fungsi untuk Tahan/Lanjutkan transaksi
    const handleHoldTransaction = () => { if (items.length === 0) { alert("Tidak ada item untuk ditahan."); return; } const newHeldTransaction = { id: Date.now(), name: customerName || `Transaksi #${Date.now().toString().slice(-5)}`, heldAt: new Date().toLocaleString('id-ID'), itemCount: items.length, data: { items, customerName, taxRate, discount, selectedCustomerId }, }; const updatedHeldTransactions = [...heldTransactions, newHeldTransaction]; setHeldTransactions(updatedHeldTransactions); localStorage.setItem(HELD_TRANSACTIONS_KEY, JSON.stringify(updatedHeldTransactions)); alert(`Transaksi untuk "${newHeldTransaction.name}" berhasil ditahan.`); handleCancelTransaction(); };
    const handleResumeTransaction = (transactionId: number) => { const transactionToResume = heldTransactions.find(t => t.id === transactionId); if (!transactionToResume) { alert("Transaksi yang ditahan tidak ditemukan."); return; } const { items, customerName, taxRate, discount, selectedCustomerId } = transactionToResume.data; setItems(items); setCustomerName(customerName); setTaxRate(taxRate); setDiscount(discount); setSelectedCustomerId(selectedCustomerId); handleDeleteHeldTransaction(transactionId, false); alert(`Transaksi "${transactionToResume.name}" berhasil dilanjutkan.`); setResumeModalOpen(false); };
    const handleDeleteHeldTransaction = (transactionId: number, showAlert = true) => { const updatedHeld = heldTransactions.filter(t => t.id !== transactionId); setHeldTransactions(updatedHeld); localStorage.setItem(HELD_TRANSACTIONS_KEY, JSON.stringify(updatedHeld)); if (showAlert) { alert("Transaksi yang ditahan berhasil dihapus."); } };

    // Fungsi-fungsi untuk Pembayaran
    const handleCashPayment = () => {
        if (items.length === 0) { alert("Keranjang kosong!"); return; }
        if (!isPaymentSufficient) { alert("Jumlah bayar kurang dari Grand Total!"); return; }
    
        const transactionData = {
            items,
            grandTotal,
            paymentAmount: paymentAmountRaw,
            change: change > 0 ? change : 0,
            customerName,
            customer_id: selectedCustomerId, // Kirim ID customer
        };
        const originalTotalForPrint = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);

        router.post(route('transactions.store.cash'), transactionData, {
            onStart: () => setIsProcessing(true),
            onSuccess: () => { handlePrint({ ...transactionData, total: originalTotalForPrint, discount: discountAmount, tax }); alert(`Pembayaran berhasil! Kembalian: ${formatRupiah(change > 0 ? change : 0)}`); handleCancelTransaction(); },
            onError: (errors) => { const firstError = Object.values(errors)[0]; alert(`Terjadi kesalahan: ${firstError}`); },
            onFinish: () => { setIsProcessing(false); },
        });
    };
    const handleMidtransPayment = async () => {
        if (items.length === 0) { alert("Keranjang kosong!"); return; }
        setIsProcessing(true);
        const transactionData = {
            items,
            grandTotal,
            customerName,
            customer_id: selectedCustomerId, // Kirim ID customer
        };
        try {
            const response = await axios.post(route('transactions.store.midtrans'), transactionData);
            const { snap_token } = response.data;
            if (!snap_token) { alert('Gagal mendapatkan token pembayaran.'); setIsProcessing(false); return; }
            window.snap.pay(snap_token, {
                onSuccess: (result) => { alert("Pembayaran sukses!"); handleCancelTransaction(); },
                onPending: (result) => { alert("Menunggu pembayaran Anda."); handleCancelTransaction(); },
                onError: (result) => { alert("Pembayaran gagal!"); },
                onClose: () => { /* User menutup popup */ }
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan pada server.';
            alert(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    // -- Kalkulasi Total --
    const total = items.reduce((acc, i) => acc + i.subtotal, 0);
    const discountAmount = Number(discount) || 0;
    const totalItemDiscount = items.reduce((acc, item) => acc + (item.discount || 0), 0);
    const totalOverallDiscount = totalItemDiscount + discountAmount;
    const subtotalAfterDiscount = total - discountAmount;
    const taxPercentage = Number(taxRate) || 0;
    const tax = subtotalAfterDiscount * (taxPercentage / 100);
    const grandTotal = subtotalAfterDiscount + tax;
    const change = paymentAmountRaw - grandTotal;
    const isPaymentSufficient = paymentAmountRaw >= grandTotal;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            {/* Modal Scanner */}
            {isScannerModalOpen && ( <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"> <div className="bg-card rounded-xl p-6 w-full max-w-lg relative border"> <button onClick={handleCloseScannerModal} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"><X size={24} /></button> <h3 className="text-xl font-semibold mb-4 text-center text-foreground">Pindai barcode booking</h3> {isCameraActive ? ( <> <div className='bg-muted rounded-md w-full h-[300px] flex items-center justify-center overflow-hidden'> <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: 'environment' }} className="object-cover w-full h-full" /> </div> <button onClick={() => setCameraActive(false)} className="w-full mt-4 bg-secondary text-secondary-foreground py-2 rounded-lg hover:bg-secondary/80 font-semibold transition-colors">Kembali</button> </> ) : ( <div className="flex flex-col gap-4 mt-6"> <button onClick={() => setCameraActive(true)} className="w-full bg-primary text-primary-foreground py-4 rounded-lg hover:bg-primary/90 text-lg font-semibold transition-colors flex items-center justify-center gap-3"><Camera size={22} /> Gunakan Kamera</button> <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" /> <button onClick={() => fileInputRef.current?.click()} className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 text-lg font-semibold transition-colors flex items-center justify-center gap-3"><Upload size={22} /> Unggah Gambar Barcode</button> </div> )} {error && <p className="text-destructive mt-3 text-center text-sm">Error: {error}</p>} </div> </div> )}
            
            {/* Modal Lanjutkan Transaksi */}
            {isResumeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl p-6 w-full max-w-2xl relative border flex flex-col max-h-[80vh]">
                        <button onClick={() => setResumeModalOpen(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"><X size={24} /></button>
                        <h3 className="text-xl font-semibold mb-4 text-center text-foreground">Lanjutkan Transaksi Tertahan</h3>
                        <div className="flex-grow overflow-y-auto -mx-6 px-6">
                            {heldTransactions.length > 0 ? (
                                <ul className="space-y-3">
                                    {heldTransactions.map(trans => (
                                        <li key={trans.id} className="border rounded-lg p-4 flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex-grow">
                                                <p className="font-semibold text-foreground">{trans.name}</p>
                                                <p className="text-sm text-muted-foreground">{trans.itemCount} item | Ditahan pada: {trans.heldAt}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button onClick={() => handleResumeTransaction(trans.id)} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/90">Lanjutkan</button>
                                                <button onClick={() => handleDeleteHeldTransaction(trans.id)} className="bg-destructive text-destructive-foreground p-2 rounded-md hover:bg-destructive/90"><Trash2 size={18} /></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p className="text-center text-muted-foreground py-10">Tidak ada transaksi yang ditahan.</p>)}
                        </div>
                    </div>
                </div>
            )}

            {/* Layout Utama */}
            <div className="flex h-full flex-1 flex-col gap-4 p-7">
                <div className="mb-1">
                    {products && products.length > 0 && <h2 className="text-xl font-semibold mb-4 text-foreground">Mau kemana?</h2>}
                    <ProductCarousel products={products} onProductClick={addProductToTransaction}/>
                </div>
                <div className="flex flex-col lg:flex-row flex-1 gap-6 min-h-[700px]">
                    {/* Panel Kiri: Form Transaksi */}
                    <div className="w-full lg:w-3/5 border rounded-xl p-4 sm:p-6 flex flex-col shadow-lg bg-card text-card-foreground">
                        <h2 className="font-bold text-xl mb-4">Form Transaksi</h2>
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            {/* Input Customer dengan Pencarian */}
                            <div className='flex-1'>
                                <label htmlFor="customer" className="block text-sm font-medium text-muted-foreground mb-1">Nama Pelanggan (Ketik atau Pilih)</label>
                                <div className="relative">
                                    <input id="customer" type="text" placeholder="cth: John Doe" className="w-full border bg-background rounded-md px-3 py-2 focus:ring-2 focus:ring-ring" value={customerName} onChange={(e) => setCustomerName(e.target.value)} onFocus={() => { if (customerSearchResults.length > 0) { setCustomerDropdownOpen(true); } }} autoComplete="off" />
                                    {isCustomerDropdownOpen && customerSearchResults.length > 0 && (
                                        <ul className="absolute z-30 w-full border rounded-md mt-1 max-h-52 overflow-y-auto bg-popover text-popover-foreground shadow-lg" onMouseLeave={() => setCustomerDropdownOpen(false)}>
                                            {customerSearchResults.map(customer => ( <li key={customer.id} className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer" onMouseDown={(e) => { e.preventDefault(); handleSelectCustomer(customer); }}>{customer.name}</li> ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            {/* Input Pencarian Produk */}
                            <div className='flex-1'>
                                <label htmlFor="search" className="block text-sm font-medium text-muted-foreground mb-1">Cari</label>
                                <div className='relative'>
                                    <input id="search" type="text" placeholder="Cari produk..." className="w-full border bg-background rounded-md px-3 py-2 focus:ring-2 focus:ring-ring" value={searchText} onChange={(e) => setSearchText(e.target.value)} autoComplete='off' />
                                    {searchResults.length > 0 && ( <ul className="absolute z-20 w-full border rounded-md mt-1 max-h-64 overflow-y-auto bg-popover text-popover-foreground shadow-lg"> {searchResults.map((p) => ( <li key={p.id} className="hover:bg-accent hover:text-accent-foreground cursor-pointer border-b last:border-b-0" onClick={() => { addProductToTransaction(p); setSearchText(''); setSearchResults([]); }}> <div className="flex items-center gap-4 p-2"> <img src={p.images && p.images.length > 0 ? (p.images[0].image_path.startsWith('http') ? p.images[0].image_path : `/storage/${p.images[0].image_path}`) : 'https://via.placeholder.com/150?text=No+Image'} alt={p.name} className="w-16 h-16 rounded-md object-cover bg-muted flex-shrink-0" /> <div className="flex-grow min-w-0"> <p className="font-semibold text-foreground truncate" title={p.name}>{p.name}</p> <p className="text-xs text-muted-foreground">SKU: {p.sku}</p> <div className="flex justify-between items-center mt-1"> <p className="text-sm font-medium text-primary">Rp {Number(p.price).toLocaleString()}</p> <p className="text-xs font-semibold text-muted-foreground">Stok: {p.stock}</p> </div> </div> </div> </li> ))} </ul> )}
                                </div>
                            </div>
                        </div>
                        {/* Tabel Keranjang */}
                        <div className="flex-grow overflow-y-auto -mx-4 sm:-mx-6 px-4 sm:px-6 border-t border-b">
                            <table className="table-auto w-full">
                                <thead className="sticky top-0 bg-muted z-10"><tr><th className="p-3 text-left font-semibold text-sm text-muted-foreground">Produk</th><th className="p-3 text-center font-semibold text-sm text-muted-foreground w-24">Qty</th><th className="p-3 text-right font-semibold text-sm text-muted-foreground w-32">Harga</th><th className="p-3 text-right font-semibold text-sm text-muted-foreground w-32">Diskon (Rp)</th><th className="p-3 text-right font-semibold text-sm text-muted-foreground w-32">Subtotal</th><th className="p-3 text-center font-semibold text-sm text-muted-foreground w-20">Aksi</th></tr></thead>
                                <tbody>
                                    {items.length === 0 ? ( <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">Keranjang masih kosong</td></tr> ) : ( items.map((item) => ( <tr key={item.product_id} className="border-b"> <td className="p-3">{item.name}</td> <td className="p-3 text-center"> <input type="number" min={1} value={item.quantity} className="w-16 text-center border bg-background rounded-md py-1" onChange={(e) => updateQty(item.product_id, Number(e.target.value))} onFocus={(e) => e.target.select()} /> </td> <td className="p-3 text-right">Rp {item.price.toLocaleString()}</td> <td className="p-3 text-right"> <input type="number" min={0} placeholder='0' value={item.discount === 0 ? '' : item.discount} className="w-24 text-right border bg-background rounded-md py-1 px-2" onChange={(e) => updateItemDiscount(item.product_id, Number(e.target.value))} onFocus={(e) => e.target.select()} /> </td> <td className="p-3 text-right font-medium">Rp {item.subtotal.toLocaleString()}</td> <td className="p-3 text-center"> <button onClick={() => removeProduct(item.product_id)} className="text-destructive hover:text-destructive/80 p-2"><X size={20} /></button> </td> </tr> )) )}
                                </tbody>
                            </table>
                        </div>
                        {/* Detail Total */}
                        <div className="mt-auto pt-4 space-y-2 text-md">
                            <div className="flex justify-between"><span>Subtotal</span><span className='font-medium'>Rp {total.toLocaleString('id-ID')}</span></div>
                            <div className="flex justify-between items-center"><label htmlFor="discount" className="text-muted-foreground">Diskon (Rp)</label><input id="discount" type="number" placeholder="0" className="w-32 text-right border bg-background rounded-md px-2 py-1" value={discount} onChange={(e) => setDiscount(e.target.value)} onFocus={(e) => e.target.select()} /></div>
                            <div className="flex justify-between items-center"><label htmlFor="tax" className="text-muted-foreground">Pajak (%)</label><input id="tax" type="number" placeholder="0" className="w-32 text-right border bg-background rounded-md px-2 py-1" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} onFocus={(e) => e.target.select()} /></div>
                            <div className="border-t pt-2 mt-2 space-y-2">{totalOverallDiscount > 0 && ( <div className="flex justify-between"> <span className="text-muted-foreground">Total Diskon</span> <span className="font-medium text-destructive">- Rp {totalOverallDiscount.toLocaleString('id-ID')}</span> </div> )}<div className="flex justify-between"><span className="text-muted-foreground">Total Pajak</span> <span>Rp {tax.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span></div></div>
                            <div className="flex justify-between font-bold text-2xl border-t-2 border-foreground pt-2 mt-2"><span>Grand Total</span> <span>Rp {grandTotal.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span></div>
                        </div>
                    </div>

                    {/* Panel Kanan: Aksi & Pembayaran */}
                    <div className="w-full lg:w-2/5 border rounded-xl p-4 sm:p-6 flex flex-col shadow-lg bg-card">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button onClick={() => setScannerModalOpen(true)} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 text-lg font-semibold transition-colors flex items-center justify-center gap-2" ><ScanBarcode size={20}/> Pindai</button>
                            <button onClick={() => setResumeModalOpen(true)} className="relative w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 text-lg font-semibold transition-colors flex items-center justify-center gap-2" ><History size={20}/> Lanjutkan{heldTransactions.length > 0 && (<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{heldTransactions.length}</span>)}</button>
                        </div>
                        <div className='border-t pt-4'>
                            <h3 className="font-bold text-xl mb-4 text-card-foreground">Pembayaran</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="payment" className="block text-sm font-medium text-muted-foreground mb-1">Jumlah Bayar</label>
                                    <input id="payment" type="text" placeholder="Rp 0" className="w-full border bg-background text-foreground rounded-md px-3 py-2 text-lg focus:ring-2 focus:ring-green-500" value={paymentAmount} onChange={(e) => { setPaymentAmount(formatRupiah(e.target.value)); setPaymentAmountRaw(parseRupiah(e.target.value)); }} onFocus={(e) => e.target.select()} />
                                    {items.length > 0 && !isPaymentSufficient && paymentAmountRaw > 0 && (<p className="text-destructive text-sm mt-1">Maaf, nominal bayar kurang dari Grand Total.</p>)}
                                </div>
                                <div className="flex justify-between items-center bg-muted p-3 rounded-md"><span className='font-medium text-lg text-muted-foreground'>Kembalian</span><span className='font-bold text-xl text-green-600'>{change > 0 && isPaymentSufficient ? formatRupiah(change) : 'Rp 0'}</span></div>
                            </div>
                        </div>
                        <div className="mt-auto space-y-3 pt-6">
                            <button onClick={handleCashPayment} className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg hover:bg-primary/90 text-lg font-semibold transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed" disabled={items.length === 0 || !isPaymentSufficient || isProcessing}>{isProcessing ? 'Memproses...' : 'Bayar Tunai'}</button>
                            <button onClick={handleMidtransPayment} className="w-full bg-sky-600 text-white py-3.5 rounded-lg hover:bg-sky-700 text-lg font-semibold transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed" disabled={items.length === 0 || isProcessing}>{isProcessing ? 'Memproses...' : 'Bayar Online / QRIS'}</button>
                            <div className='flex gap-3'>
                                <button onClick={handleHoldTransaction} className="w-full bg-yellow-500 text-white py-2.5 rounded-lg hover:bg-yellow-600 font-semibold transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed" disabled={items.length === 0}>Tahan</button>
                                <button onClick={handleCancelTransaction} className="w-full bg-destructive text-white py-2.5 rounded-lg hover:bg-destructive/90 font-semibold transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed" disabled={items.length === 0}>Batal</button>
                            </div>
                        </div> 
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}