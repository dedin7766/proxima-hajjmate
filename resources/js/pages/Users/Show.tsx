import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm} from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Show',
        href: '/users',
    },
];

export default function Show({ user}) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Show" />

            <div className='p-3'>
                <Link 
                    href={route('users.index')}
                    className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-green-400 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                    Back
                </Link>

                <div className='mt-5'>
                    <p><strong>Name: </strong>{user.name}</p>
                    <p><strong>Email: </strong>{user.email}</p>
                </div>

            </div>
        </AppLayout>
    );
}
