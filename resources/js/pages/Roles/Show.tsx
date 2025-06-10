import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm} from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles Show',
        href: '/roles',
    },
];

export default function Show({ role, permissions }) {


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="roles Create" />
            <div className='p-3'>
                <Link 
                    href={route('roles.index')}
                    className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-green-400 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                    Back
                </Link>

                <div className='mt-5'>
                    <p><strong>Name</strong> {role.name}</p>
                    <p><strong>Permissions</strong></p>
                    {permissions.map((permission) => 
                        <span
                            key="1"
                            className="mr-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300"
                        >
                            {permission}
                        </span>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}
