// src/components/pos/InvoiceSearch.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input'; // Assuming shadcn/ui Input
import { Invoice } from '@/types'; // Import the Invoice type
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'; // Assuming shadcn/ui Command

interface InvoiceSearchProps {
  onInvoiceSelect: (invoice: Invoice) => void;
}

export default function InvoiceSearch({ onInvoiceSelect }: InvoiceSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // State for controlling Command popover
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (searchQuery.length < 2) {
        setInvoices([]);
        setLoading(false);
        setOpen(false);
        return;
      }

      setLoading(true);
      try {
        // Adjust the API endpoint as per your Laravel route
        const response = await fetch(`/invoices/search?query=${searchQuery}`);
        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }
        const data: Invoice[] = await response.json();
        setInvoices(data);
        setOpen(true); // Open the command menu if there are results
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setInvoices([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchInvoices();
    }, 300); // Debounce search to prevent too many requests

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Close command menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectInvoice = (invoice: Invoice) => {
    onInvoiceSelect(invoice);
    setSearchQuery(invoice.invoice_number); // Display selected invoice number
    setInvoices([]); // Clear search results
    setOpen(false); // Close the command menu
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <Command shouldFilter={false} className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Cari Nomor Invoice..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="h-9"
          onFocus={() => searchQuery.length >= 2 && setOpen(true)} // Re-open on focus if query exists
        />
        {open && (invoices.length > 0 || loading) && (
          <CommandList>
            {loading ? (
              <CommandEmpty>Loading...</CommandEmpty>
            ) : invoices.length === 0 ? (
              <CommandEmpty>Tidak ada invoice ditemukan.</CommandEmpty>
            ) : (
              <CommandGroup>
                {invoices.map((invoice) => (
                  <CommandItem
                    key={invoice.id}
                    onSelect={() => handleSelectInvoice(invoice)}
                  >
                    {invoice.invoice_number} - {invoice.customer_name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
}