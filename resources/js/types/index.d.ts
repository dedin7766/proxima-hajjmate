import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[]; // Tambahan untuk sub-menu
}


export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}


export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    description?: string;
    category_id: number;
    category?: Category; // Relasi yang di-load
}

// Tipe untuk object paginasi dari Laravel
export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

// Tipe untuk Gambar Produk
export interface ProductImage {
    id: number;
    product_id: number;
    image_path: string;
}

// Tipe untuk Produk
export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number | string;
    stock: number;
    sku: string;
    images?: ProductImage[];
}

// Tipe untuk item di dalam keranjang transaksi
export interface ProductInTransaction {
    product_id: number;
    name: string;
    quantity: number;
    price: number;
    discount: number;
    subtotal: number;
}

// Tipe untuk data transaksi yang ditahan
export interface HeldTransaction {
    id: number;
    name: string;
    heldAt: string;
    itemCount: number;
    data: {
        items: ProductInTransaction[];
        customerName: string;
        taxRate: string;
        discount: string;
        selectedCustomerId: number | null;
    };
}

// Tipe untuk data Customer
export interface Customer {
    id: number;
    name: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  issue_date: string;
  due_date: string | null;
  total_amount: number;
  amount_paid: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash: {
        success?: string;
        error?: string;
    }
    
};