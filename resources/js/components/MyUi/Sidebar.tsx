//resources/js/components/MyUi/Sidebar.tsx

import { 
    LayoutGrid, 
    Users, 
    Notebook, 
    ChevronFirst, 
    ChevronLast, 
    Archive,
    Package, // <- Tambahkan ikon untuk Products
    ChevronDown 
} from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

// Tipe NavItem dibuat rekursif, subItems bisa berisi NavItem lagi
interface NavItem {
    title: string;
    href?: string;
    icon?: React.ElementType; // icon dibuat opsional untuk sub-sub-menu
    subItems?: NavItem[];
}

// Definisikan struktur menu baru yang multi-level
const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Roles',
        href: '/roles',
        icon: Notebook,
    },
    {
        title: 'Master Data',
        icon: Archive,
        subItems: [
            // INI MENU PRODUCTS YANG SEKARANG PUNYA SUB-MENU LAGI
            {
                title: 'Products',
                icon: Package, // Beri ikon pada menu level 2
                subItems: [
                    {
                        title: 'All Products',
                        href: '/dashboard',
                    },
                    {
                        title: 'Add New Product',
                        href: '/products/create',
                    },
                ],
            },
            {
                title: 'Categories',
                href: '/categories',
                // Anda bisa menambahkan ikon di sini jika mau
            },
        ],
    },
];

const currentYear = new Date().getFullYear();

// Helper function rekursif untuk mengecek item aktif pada level manapun
function isItemActive(item: NavItem, currentUrl: string): boolean {
    if (item.href === currentUrl) {
        return true;
    }
    if (item.subItems) {
        // Jika salah satu anaknya aktif, maka parent-nya juga dianggap aktif
        return item.subItems.some(subItem => isItemActive(subItem, currentUrl));
    }
    return false;
}

// Komponen SidebarItem yang sekarang rekursif
function SidebarItem({ item, collapsed, currentUrl }: { item: NavItem; collapsed: boolean; currentUrl: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const isActive = isItemActive(item, currentUrl);

    // Buka dropdown secara otomatis jika itemnya atau salah satu anaknya aktif
    useEffect(() => {
        if (isActive && !collapsed) {
            setIsOpen(true);
        }
    }, [isActive, collapsed]);
    
    // Jika item memiliki sub-menu, render sebagai dropdown
    if (item.subItems) {
        return (
            <li>
                <button
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={`flex items-center justify-between w-full gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors ${
                        isActive ? 'bg-gray-800' : ''
                    }`}
                >
                    <div className="flex items-center gap-3">
                        {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
                        <span
                            className={`text-sm font-medium overflow-hidden transition-all duration-200 ${
                                collapsed ? 'w-0' : 'w-full'
                            }`}
                        >
                            {item.title}
                        </span>
                    </div>
                    {!collapsed && (
                        <ChevronDown 
                            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                        />
                    )}
                </button>
                {/* Render Sub-menu secara rekursif */}
                {!collapsed && isOpen && (
                    <ul className="pl-6 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                           <SidebarItem key={subItem.title} item={subItem} collapsed={collapsed} currentUrl={currentUrl} />
                        ))}
                    </ul>
                )}
            </li>
        );
    }

    // Render sebagai item link biasa (menu paling dalam)
    return (
        <li>
            <Link
                href={item.href!}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm ${
                    isActive ? 'bg-gray-600' : '' // Warna aktif untuk sub-item bisa dibedakan
                }`}
            >
                {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
                <span
                    className={`overflow-hidden transition-all duration-200 ${
                        collapsed ? 'w-0' : 'w-full'
                    }`}
                >
                    {item.title}
                </span>
            </Link>
        </li>
    );
}


export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const { url } = usePage();

    return (
        <aside
            className={`h-screen bg-gray-900 text-white flex flex-col fixed top-0 left-0 transition-all duration-300 ease-in-out ${
                collapsed ? 'w-20' : 'w-64'
            }`}
        >
            <div className="p-4 pb-2 flex justify-between items-center border-b border-gray-800">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    {!collapsed && (
                    <span className="transition-all duration-200 w-32 overflow-hidden">
                        POS App
                    </span>
                    )}
                </Link>

                <button
                    onClick={() => setCollapsed((prev) => !prev)}
                    className="p-1.5 mr-2 rounded-lg bg-gray-800 hover:bg-gray-700"
                >
                    {collapsed ? <ChevronLast /> : <ChevronFirst />}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto">
                <ul className="space-y-2 mt-4 px-2">
                    {navItems.map((item) => (
                        <SidebarItem key={item.title} item={item} collapsed={collapsed} currentUrl={url} />
                    ))}
                </ul>
            </nav>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-400 overflow-hidden">
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'}`}>
                <span className={!collapsed ? 'block' : 'hidden'}>© {currentYear} PROXIMA SUITE</span>
            </div>
        </div>

        </aside>
    );
}