import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm} from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Create',
        href: '/users',
    },
];

export default function Create({ roles }) {

    const {data, setData, errors, post} = useForm({
        name: "",
        email: "",
        password: "",
        roles: [],
    });

    function handleCheckboxChange(roleName, checked) {
        if(checked) {
            setData("roles", [...data.roles, roleName]);
        }else {
            setData("roles", data.roles.filter(name => name !== roleName));
        }
    }

    function submit(e) {
        e.preventDefault();
        post(route('users.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Create" />
            <div className='p-3'>

                <Link href={route('users.index')}>
                    <Button variant="secondary" size="icon" className="size-8">
                        <ChevronLeftIcon />
                    </Button>
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
                            placeholder="Enter your name"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label for="email" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                            Email:
                        </label>
                        <input
                            id="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            name="email"
                            type="email"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your email"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label for="password" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                            Password:
                        </label>
                        <input
                            id="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            name="password"
                            type="password"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your password"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label for="Roles" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                            Roles:
                        </label>
                        {roles.map((role) => 
                        <label key={role} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                value={role}
                                onChange={(e) => handleCheckboxChange(role, e.target.checked)}
                                id={role}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-800 capitalize">{role}</span>
                        </label>
                        )}
                        {errors.roles && <p className="text-red-500 text-sm mt-1">{errors.roles}</p>}
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
