import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm} from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles Create',
        href: '/roles',
    },
];

export default function Create({ permissions }) {

    const {data, setData, errors, post} = useForm({
        name: "",
        permissions: [],
    });

    function handleCheckboxChange(permissionName, checked) {
        if(checked) {
            setData("permissions", [...data.permissions, permissionName]);
        }else {
            setData("permissions", data.permissions.filter(name => name !== permissionName));
        }
    }

    function submit(e) {
        e.preventDefault();
        post(route('roles.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="roles Create" />
            <div className='p-3'>
                <Link 
                    href={route('roles.index')}
                    className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-green-400 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                    Back
                </Link>

                <form onSubmit={submit} className="space-y-6 mt-4 max-w-md mx-auto">
                
                    <div className="grid gap-2">
                        <label for="name" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                            Name:
                        </label>
                        <input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            name="name"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter name"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label for="Permissions" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                            Permissions:
                        </label>
                        {permissions.map((permission) => 
                        <label key={permission} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                value={permission}
                                onChange={(e) => handleCheckboxChange(permission, e.target.checked)}
                                id={permission}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-800 capitalize">{permission}</span>
                        </label>
                        )}
                        {errors.permissions && <p className="text-red-500 text-sm mt-1">{errors.permissions}</p>}
                    </div>

                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition"
                    >
                        Submit
                    </button>
                
                </form>

            </div>
        </AppLayout>
    );
}
