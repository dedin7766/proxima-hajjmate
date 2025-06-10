import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { can } from '@/lib/can';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, DiamondPlus, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

export default function Index({ users }) {

    function handleDelete(id){
        if(confirm("Are you sure you want to remove this")){
            router.delete(route('users.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className='p-3'>
               {can('users.create') && (
                <Link href={route('users.create')}>
                    <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Create
                    </Button>
                </Link>
               )}

               <div className="overflow-x-auto mt-3">
                    <Table>
                    <TableCaption>List of users with their roles.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(({id, name, email, roles}) => (
                            <TableRow key={id}>
                                <TableCell className="font-medium">{id}</TableCell>
                                <TableCell>{name}</TableCell>
                                <TableCell>{email}</TableCell>
                                <TableCell>
                                    {roles.map((role, index) => (
                                        <span
                                            key={index}
                                            className="mr-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300"
                                        >
                                            {role.name}
                                        </span>
                                    ))}
                                </TableCell>
                                <TableCell>
                                    <Link
                                        href={route('users.show', id)}
                                        className="mr-1 cursor-pointer px-3 py-1 text-xs font-medium text-white bg-gray-700 rounded hover:bg-gray-800"
                                    >
                                        Show
                                    </Link>
                                    {can('users.edit') && (
                                        <Link
                                            href={route('users.edit', id)}
                                            className="mr-1 cursor-pointer px-3 py-1 text-xs font-medium text-white bg-blue-700 rounded hover:bg-blue-800"
                                        >
                                            Edit
                                        </Link>
                                    )}
                                    {can('users.delete') && (
                                        <button
                                            onClick={() => handleDelete(id)}
                                            className="cursor-pointer px-3 py-1 text-xs font-medium text-white bg-red-700 rounded hover:bg-red-800"
                                        >
                                            Delete
                                        </button>
                                    )}
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
