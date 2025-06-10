// resources/js/Pages/Invoices/InvoicePrintLayout.jsx
 

 import React from 'react';
 

 // Fungsi untuk format mata uang
 const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
 const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
 

 export default function InvoicePrintLayout({ invoice }) {
  // Ganti dengan data perusahaan Anda
  const company = {
  name: 'PT. Teknologi Maju Bersama',
  address: 'Jl. Jenderal Sudirman Kav. 52-53, Jakarta Selatan, 12190',
  phone: '(021) 123-4567',
  email: 'kontak@teknologimaju.com',
  logo: '/images/company-logo.png', // Simpan logo di folder public/images
  };
 

  return (
  <div className="font-sans text-sm text-gray-800 bg-white printable-area p-8">
  <header className="flex items-center justify-between pb-6 border-b-2 border-gray-800">
  <div className="flex items-center">
  {/* Ganti dengan logo Anda */}
  <img src={company.logo} alt="Company Logo" className="h-16 w-16 mr-4" />
  <div>
  <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
  <p className="text-xs text-gray-600">{company.address}</p>
  <p className="text-xs text-gray-600">Telp: {company.phone} | Email: {company.email}</p>
  </div>
  </div>
  <div className="text-right">
  <h2 className="text-4xl font-bold uppercase text-gray-800">INVOICE</h2>
  <p className="text-gray-600">{invoice.invoice_number}</p>
  </div>
  </header>
 

  <main className="mt-8 grid grid-cols-2 gap-12">
  <div>
  <h3 className="font-semibold text-gray-800 mb-2">Ditagihkan Kepada:</h3>
  <p className="font-bold">{invoice.customer_name}</p>
  {/* Tambahkan alamat customer jika ada di data */}
  </div>
  <div className="text-right">
  <div className="flex justify-end mb-1">
  <p className="font-semibold w-32">Tanggal Invoice:</p>
  <p className="w-40">{formatDate(invoice.issue_date)}</p>
  </div>
  <div className="flex justify-end">
  <p className="font-semibold w-32">Jatuh Tempo:</p>
  <p className="w-40">{formatDate(invoice.due_date)}</p>
  </div>
  </div>
  </main>
 

  <div className="mt-8">
  <table className="w-full text-left">
  <thead>
  <tr className="bg-gray-800 text-white">
  <th className="p-3 font-semibold">Deskripsi</th>
  <th className="p-3 font-semibold text-right">Jumlah</th>
  </tr>
  </thead>
  <tbody>
  {invoice.transactions.map(tx => (
  <tr key={tx.id} className="border-b">
  <td className="p-3">
  Transaksi #{tx.invoice_number} <br />
  <span className="text-xs text-gray-600">{tx.customer_name}</span>
  </td>
  <td className="p-3 text-right">{formatCurrency(tx.total_amount)}</td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
 

  <div className="mt-8 flex justify-end">
  <div className="w-64">
  <div className="flex justify-between border-b pb-2">
  <span className="font-semibold">Subtotal:</span>
  <span>{formatCurrency(invoice.total_amount)}</span>
  </div>
  <div className="flex justify-between pt-2">
  <span className="font-semibold">Sudah Dibayar:</span>
  <span>- {formatCurrency(invoice.amount_paid)}</span>
  </div>
  <div className="flex justify-between bg-gray-200 p-2 mt-4 rounded">
  <span className="font-bold text-lg">Sisa Tagihan:</span>
  <span className="font-bold text-lg">{formatCurrency(invoice.remaining_balance)}</span>
  </div>
  </div>
  </div>
 

  <div className="mt-8">
  <h2 className="text-xl font-semibold mb-4">Riwayat Pembayaran</h2>
  <table className="w-full text-left">
  <thead>
  <tr className="bg-gray-800 text-white">
  <th className="p-3 font-semibold">Tanggal</th>
  <th className="p-3 font-semibold text-right">Jumlah</th>
  <th className="p-3 font-semibold">Metode</th>
  </tr>
  </thead>
  <tbody>
  {invoice.payments.length > 0 ? (
  invoice.payments.map((payment) => (
  <tr key={payment.id} className="border-b">
  <td className="p-3">{new Date(payment.payment_date).toLocaleDateString('id-ID')}</td>
  <td className="p-3 text-right">{formatCurrency(payment.payment_amount)}</td>
  <td className="p-3">{payment.payment_method}</td>
  </tr>
  ))
  ) : (
  <tr>
  <td colSpan="3" className="p-3 text-center">Tidak ada pembayaran.</td>
  </tr>
  )}
  </tbody>
  </table>
  </div>
 

  <footer className="mt-12 pt-6 border-t">
  <h4 className="font-semibold mb-2">Catatan:</h4>
  <p className="text-xs text-gray-600">
  {invoice.notes || 'Pembayaran dapat dilakukan melalui transfer ke rekening BCA 123456789 a.n. PT. Teknologi Maju Bersama.'}
  </p>
  <p className="text-center text-xs text-gray-500 mt-8">
  Terima kasih atas kepercayaan Anda.
  </p>
  </footer>
  </div>
  );
 }