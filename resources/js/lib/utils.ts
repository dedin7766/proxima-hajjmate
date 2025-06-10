import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// src/lib/utils.ts

/**
 * Mengubah angka atau string dari INPUT USER menjadi format mata uang Rupiah.
 * Fungsi ini membersihkan karakter non-angka.
 * Contoh: 10000 -> "Rp 10.000"
 */
export const formatRupiah = (value: string | number): string => {
    const numberValue = Number(String(value).replace(/[^0-9]/g, ''));
    if (isNaN(numberValue)) return 'Rp 0';
    if (String(value).trim() === '' || numberValue === 0) return 'Rp 0';
    return `Rp ${numberValue.toLocaleString('id-ID')}`;
};

/**
 * Mengubah string format Rupiah dari INPUT USER kembali menjadi angka.
 * Contoh: "Rp 10.000" -> 10000
 */
export const parseRupiah = (value: string): number => {
    return Number(String(value).replace(/[^0-9]/g, ''));
};

/**
 * Mengubah angka murni (dari backend) menjadi format Rupiah untuk DITAMPILKAN.
 * Fungsi ini lebih aman karena tidak melakukan replace karakter.
 */
export const formatDisplayRupiah = (value: string | number | null): string => {
    const numberValue = Number(value); // Konversi langsung ke angka

    if (isNaN(numberValue)) {
        return 'Rp 0';
    }

    // Menggunakan toLocaleString untuk format yang benar
    return `Rp ${numberValue.toLocaleString('id-ID', {
        minimumFractionDigits: 0, // Tidak menampilkan desimal jika 0
        maximumFractionDigits: 0, // Membulatkan desimal
    })}`;
};