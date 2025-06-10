// resources/js/Pages/Invoices/Index.jsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps, type Paginated, type Invoice as InvoiceType } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PrinterIcon, FileDownIcon } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoices',
        href: route('invoices.index'),
    },
];

interface Props extends PageProps {
    invoices: Paginated<InvoiceType>;
    filters: {
        search: string;
        status: string;
        limit: string;
    };
}

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'PAID':
            return 'default';
        case 'PARTIALLY_PAID':
            return 'secondary';
        case 'UNPAID':
        case 'CANCELLED': // Assuming you might have a cancelled status
            return 'destructive';
        default:
            return 'outline';
    }
};

export default function Index({ auth, invoices, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [limit, setLimit] = useState(filters.limit || '10');

    useEffect(() => {
        const timeout = setTimeout(() => {
            const queryData: { search?: string; status?: string; limit?: string } = {
                search,
                status: statusFilter === 'all' ? '' : statusFilter,
                limit,
            };

            (Object.keys(queryData) as Array<keyof typeof queryData>).forEach((key) => {
                if (!queryData[key]) {
                    delete queryData[key];
                }
            });

            router.get(route('invoices.index'), queryData, {
                preserveState: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timeout);
    }, [search, statusFilter, limit]);

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
    };

    const handleLimitChange = (value: string) => {
        setLimit(value);
    };

    const getFilterQueryParams = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
        if (limit) params.append('limit', limit);
        return params.toString();
    };

    const handlePrint = () => {
        const query = getFilterQueryParams();
        window.open(route('invoices.print') + (query ? `?${query}` : ''), '_blank');
    };

    const handleDownloadPdf = () => {
        const query = getFilterQueryParams();
        window.location.href = route('invoices.downloadPdf') + (query ? `?${query}` : '');
    };

    // --- UPDATED: Calculate Grand Total for Total Amount AND Remaining Balance ---
    const { grandTotalAmount, grandTotalRemaining } = useMemo(() => {
        const totalAmount = invoices.data.reduce((sum, invoice) => sum + invoice.total_amount, 0);
        const totalRemaining = invoices.data.reduce((sum, invoice) => sum + invoice.remaining_balance, 0);
        return { grandTotalAmount: totalAmount, grandTotalRemaining: totalRemaining };
    }, [invoices.data]);
    // --- END UPDATED ---

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Invoices" />

            <div className="m-5 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <h2 className="text-xl font-semibold">Invoice History</h2>
                        <div className="flex w-full items-center gap-2 md:w-auto">
                            {/* Search Input */}
                            <Input
                                type="search"
                                placeholder="Search invoice # or customer..."
                                className="w-full md:w-[250px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            {/* Status Filter Select */}
                            <Select onValueChange={handleStatusChange} value={statusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Limit per page Select */}
                            <Select onValueChange={handleLimitChange} value={limit}>
                                <SelectTrigger className="w-full md:w-[120px]">
                                    <SelectValue placeholder="Limit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 per page</SelectItem>
                                    <SelectItem value="25">25 per page</SelectItem>
                                    <SelectItem value="50">50 per page</SelectItem>
                                    <SelectItem value="100">100 per page</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Print Button */}
                            <Button variant="outline" onClick={handlePrint}>
                                <PrinterIcon className="mr-2 h-4 w-4" /> Print
                            </Button>

                            {/* Download PDF Button */}
                            <Button onClick={handleDownloadPdf}>
                                <FileDownIcon className="mr-2 h-4 w-4" /> Download PDF
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="border-t">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">No.</TableHead>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Remaining</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.data.length > 0 ? (
                                invoices.data.map((invoice, index) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>
                                            {invoices.from && invoices.from + index}
                                        </TableCell>
                                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                        <TableCell>{invoice.customer_name}</TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 0,
                                            }).format(invoice.total_amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 0,
                                            }).format(invoice.remaining_balance)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getStatusBadgeVariant(invoice.status)} className="capitalize">
                                                {invoice.status.replace('_', ' ').toLowerCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(invoice.due_date), 'dd MMM Y', { locale: id })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('invoices.show', invoice.id)}>View</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No invoices found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        {/* --- UPDATED: Table Footer for Grand Total Amount AND Remaining Balance --- */}
                        {invoices.data.length > 0 && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-bold">Grand Total (Current Page):</TableCell>
                                    <TableCell className="text-right font-bold">
                                        {new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            minimumFractionDigits: 0,
                                        }).format(grandTotalAmount)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            minimumFractionDigits: 0,
                                        }).format(grandTotalRemaining)}
                                    </TableCell>
                                    <TableCell colSpan={2}></TableCell> {/* Adjusted colSpan for remaining columns */}
                                </TableRow>
                            </TableFooter>
                        )}
                        {/* --- END UPDATED --- */}
                    </Table>
                </div>

                {/* Pagination */}
                {invoices.links.length > 3 && (
                    <div className="border-t p-4">
                        <Pagination>
                            <PaginationContent>
                                {invoices.links.map((link, index) => {
                                    const isDot = link.label === '...';
                                    const params = new URLSearchParams();

                                    if (search) params.append('search', search);
                                    if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
                                    if (limit) params.append('limit', limit);

                                    let hrefWithFilters = link.url;
                                    if (link.url) {
                                        const url = new URL(link.url);
                                        params.forEach((value, key) => {
                                            url.searchParams.set(key, value);
                                        });
                                        hrefWithFilters = url.toString();
                                    }

                                    return (
                                        <PaginationItem
                                            key={index}
                                            className={cn(
                                                link.active && 'rounded bg-primary-foreground',
                                                !link.url && 'text-muted-foreground pointer-events-none',
                                                isDot && 'pointer-events-none'
                                            )}
                                        >
                                            <PaginationLink asChild>
                                                <Link href={hrefWithFilters || '#'} preserveScroll preserveState>
                                                    {isDot ? (
                                                        <span>...</span>
                                                    ) : (
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    )}
                                                </Link>
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}