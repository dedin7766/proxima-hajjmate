// resources/js/Layouts/AppLayout.tsx

import React, { useState } from 'react';
import Sidebar from '@/components/MyUi/Sidebar';
import Navbar from '@/components/MyUi/Navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    // Kelas dinamis untuk padding konten utama
    const paddingLeft = collapsed ? 'pl-20' : 'pl-64';

    return (
        <div className="flex bg-gray-100 min-h-screen">
            {/* Mengirim state 'collapsed' dan fungsi 'setCollapsed' ke Sidebar */}
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${paddingLeft}`}>
                {/* Mengirim state 'collapsed' ke Navbar */}
                <Navbar collapsed={collapsed} />
                <main className="pt-16 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}