// resources/js/Pages/Customers/Index.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps, type Paginated, type Customer } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash, Pencil, Plus } from 'lucide-react';
import { can } from '@/lib/can';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customers',
        href: route('customers.index'),
    },
];

interface Props extends PageProps {
    customers: Paginated<Customer>;
}

export default function Index({ auth, customers }: Props) {
    const handleDelete = (id: number) => {
        if(confirm("Are you sure you want to remove this data?")){
            router.delete(route('customers.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Customers" />

             <div className='p-3'>
               {can('customers.create') && (
                <Link href={route('customers.create')}>
                    <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Create
                    </Button>
                </Link>
               )}

             <div className="overflow-x-auto mt-3 border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>NIK</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.data.map(customer => (
                            <TableRow key={customer.id}>
                                <TableCell>{customer.name}</TableCell>
                                <TableCell>{customer.nik}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>{customer.address}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Link href={route('customers.edit', customer.id)}>
                                        <Button variant="outline" size="sm"><Pencil className="h-4 w-4" /></Button>
                                    </Link>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(customer)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          </div>
        </AppLayout>
    );
}