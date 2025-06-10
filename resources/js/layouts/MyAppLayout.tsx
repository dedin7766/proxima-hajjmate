import React, { useState, useEffect } from 'react'; // Impor useEffect
import Sidebar from '@/components/MyUi/Sidebar';
import { Head } from '@inertiajs/react';

export default function MyAppLayout({ children, title }: { children: React.ReactNode; title: string }) {
    
    // 1. Inisialisasi state dengan sebuah fungsi.
    // Fungsi ini akan dijalankan sekali saat komponen pertama kali dirender.
    const [collapsed, setCollapsed] = useState(() => {
        // Cek apakah kode berjalan di lingkungan browser (bukan di server/SSR)
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('sidebarCollapsed');
            // Jika ada state tersimpan, gunakan itu. Jika tidak, default ke 'false'.
            return savedState ? JSON.parse(savedState) : false;
        }
        // Nilai default jika tidak di lingkungan browser
        return false;
    });

    // 2. Gunakan useEffect untuk menyimpan state ke localStorage setiap kali 'collapsed' berubah.
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    }, [collapsed]); // Dependensi [collapsed] berarti efek ini hanya berjalan saat nilai 'collapsed' berubah.

    const mainMargin = collapsed ? 'ml-20' : 'ml-64';

    return (
        <div className="flex bg-gray-50">
            <Head title={title} />
            
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <main
                className={`flex-1 min-h-screen p-6 transition-all duration-300 ease-in-out ${mainMargin}`}
            >
                {children}
            </main>
        </div>
    );
}