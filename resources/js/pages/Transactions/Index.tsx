import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps, type Paginated, type Transaction as TransactionType } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button'; // Import Button component
import { PrinterIcon, FileDownIcon } from 'lucide-react'; // Import icons
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: route('transactions.index'),
    },
];

interface Category {
    id: number;
    name: string;
}

interface Props extends PageProps {
    transactions: Paginated<TransactionType>;
    categories: Category[];
    filters: {
        search: string;
        category: string;
        limit: string;
    };
}

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'paid':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'failed':
        case 'expired':
            return 'destructive';
        default:
            return 'outline';
    }
};

export default function Index({ auth, transactions, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [limit, setLimit] = useState(filters.limit || '10');

    useEffect(() => {
        const timeout = setTimeout(() => {
            const queryData: { search?: string; category?: string; limit?: string } = {
                search,
                category,
                limit,
            };

            (Object.keys(queryData) as Array<keyof typeof queryData>).forEach((key) => {
                if (!queryData[key]) {
                    delete queryData[key];
                }
            });

            router.get(route('transactions.index'), queryData, {
                preserveState: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timeout);
    }, [search, category, limit]);

    const handleCategoryChange = (value: string) => {
        setCategory(value === 'all' ? '' : value);
    };

    const handleLimitChange = (value: string) => {
        setLimit(value);
    };

    // --- NEW: Print and PDF handlers ---
    const getFilterQueryParams = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (limit) params.append('limit', limit); // Include limit for print/PDF consistency
        return params.toString();
    };

    const handlePrint = () => {
        const query = getFilterQueryParams();
        // Open a new window/tab to the print URL
        window.open(route('transactions.print') + (query ? `?${query}` : ''), '_blank');
    };

    const handleDownloadPdf = () => {
        const query = getFilterQueryParams();
        // Redirect to the PDF download URL
        window.location.href = route('transactions.downloadPdf') + (query ? `?${query}` : '');
    };
    // --- END NEW ---

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Transactions" />

            <div className="m-5 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <h2 className="text-xl font-semibold">Transaction History</h2>
                        <div className="flex w-full items-center gap-2 md:w-auto">
                            <Input
                                type="search"
                                placeholder="Search invoice or customer..."
                                className="w-full md:w-[250px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Select onValueChange={handleCategoryChange} value={category || 'all'}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            {/* --- NEW: Print and PDF Buttons --- */}
                            <Button variant="outline" onClick={handlePrint}>
                                <PrinterIcon className="mr-2 h-4 w-4" /> Print
                            </Button>
                            <Button onClick={handleDownloadPdf}>
                                <FileDownIcon className="mr-2 h-4 w-4" /> Download PDF
                            </Button>
                            {/* --- END NEW --- */}
                        </div>
                    </div>
                </div>
                <div className="border-t">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">No.</TableHead>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.data.length > 0 ? (
                                transactions.data.map((transaction, index) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            {transactions.from && transactions.from + index}
                                        </TableCell>
                                        <TableCell className="font-medium">{transaction.invoice_number}</TableCell>
                                        <TableCell>
                                            {format(new Date(transaction.created_at), 'dd MMM Y', {
                                                locale: id,
                                            })}
                                        </TableCell>
                                        <TableCell>{transaction.customer_name || 'N/A'}</TableCell>
                                        <TableCell>
                                            {transaction.details?.map((detail) => (
                                                <div key={detail.id} className="text-xs">
                                                    - {detail.product.name} ({detail.quantity}x)
                                                </div>
                                            ))}
                                        </TableCell>
                                        <TableCell className="capitalize">{transaction.payment_method}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getStatusBadgeVariant(transaction.status)} className="capitalize">
                                                {transaction.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 0,
                                            }).format(transaction.total_amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {transactions.links.length > 3 && (
                    <div className="border-t p-4">
                        <Pagination>
                            <PaginationContent>
                                {transactions.links.map((link, index) => {
                                    const isDot = link.label === '...';

                                    const params = new URLSearchParams();
                                    if (search) {
                                        params.append('search', search);
                                    }
                                    if (category) {
                                        params.append('category', category);
                                    }
                                    if (limit) {
                                        params.append('limit', limit);
                                    }

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