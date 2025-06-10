import React, { useState, useEffect } from 'react';

interface Customer {
    id: number;
    name: string;
}

interface CustomerSearchProps {
    customers: Customer[];
    customerName: string;
    setCustomerName: (name: string) => void;
    setSelectedCustomerId: (id: number | null) => void;
}

export default function CustomerSearch({ customers, customerName, setCustomerName, setSelectedCustomerId }: CustomerSearchProps) {
    const [searchResults, setSearchResults] = useState<Customer[]>([]);
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        if (customerName.trim() === '') {
            setSearchResults([]);
            setDropdownOpen(false);
            // Hanya reset ID jika nama sengaja dikosongkan
            if (customerName === '') {
                setSelectedCustomerId(null);
            }
            return;
        }

        const filtered = customers.filter(c =>
            c.name.toLowerCase().includes(customerName.toLowerCase())
        );
        setSearchResults(filtered);
        setDropdownOpen(filtered.length > 0);
    }, [customerName, customers, setSelectedCustomerId]);

    const handleSelectCustomer = (customer: Customer) => {
        setCustomerName(customer.name);
        setSelectedCustomerId(customer.id);
        setDropdownOpen(false);
        setSearchResults([]);
    };

    return (
        <div className='flex-1'>
            <label htmlFor="customer" className="block text-sm font-medium text-muted-foreground mb-1">
                Nama Pelanggan (Ketik atau Pilih)
            </label>
            <div className="relative">
                <input
                    id="customer"
                    type="text"
                    placeholder="cth: John Doe"
                    className="w-full border bg-background rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setDropdownOpen(true); }}
                    autoComplete="off"
                />
                {isDropdownOpen && searchResults.length > 0 && (
                    <ul className="absolute z-30 w-full border rounded-md mt-1 max-h-52 overflow-y-auto bg-popover text-popover-foreground shadow-lg" onMouseLeave={() => setDropdownOpen(false)}>
                        {searchResults.map(customer => (
                            <li
                                key={customer.id}
                                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                onMouseDown={(e) => { e.preventDefault(); handleSelectCustomer(customer); }}
                            >
                                {customer.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}