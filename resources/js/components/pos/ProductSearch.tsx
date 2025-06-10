import React, { useState, useEffect } from 'react';
import { Product } from '@/components/ProductCarousel';

interface ProductSearchProps {
    products: Product[];
    onProductSelect: (product: Product) => void;
}

export default function ProductSearch({ products, onProductSelect }: ProductSearchProps) {
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);

    useEffect(() => {
        if (searchText.trim() === '') {
            setSearchResults([]);
            return;
        }
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(searchText.toLowerCase()) && p.stock > 0
        );
        setSearchResults(filtered);
    }, [searchText, products]);

    const handleSelect = (product: Product) => {
        onProductSelect(product);
        setSearchText('');
        setSearchResults([]);
    };

    return (
        <div className='flex-1'>
            <label htmlFor="search" className="block text-sm font-medium text-muted-foreground mb-1">Cari Produk</label>
            <div className='relative'>
                <input
                    id="search"
                    type="text"
                    placeholder="Ketik nama produk..."
                    className="w-full border bg-background rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    autoComplete='off'
                />
                {searchResults.length > 0 && (
                    <ul className="absolute z-20 w-full border rounded-md mt-1 max-h-64 overflow-y-auto bg-popover text-popover-foreground shadow-lg">
                        {searchResults.map((p) => (
                            <li
                                key={p.id}
                                className="hover:bg-accent hover:text-accent-foreground cursor-pointer border-b last:border-b-0"
                                onClick={() => handleSelect(p)}
                            >
                                <div className="flex items-center gap-4 p-2">
                                    <img src={p.images?.[0]?.image_path.startsWith('http') ? p.images[0].image_path : `/storage/${p.images[0].image_path}`} alt={p.name} className="w-16 h-16 rounded-md object-cover bg-muted flex-shrink-0" />
                                    <div className="flex-grow min-w-0">
                                        <p className="font-semibold text-foreground truncate" title={p.name}>{p.name}</p>
                                        <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-sm font-medium text-primary">Rp {Number(p.price).toLocaleString()}</p>
                                            <p className="text-xs font-semibold text-muted-foreground">Stok: {p.stock}</p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}