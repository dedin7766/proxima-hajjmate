import AppLayout from '@/layouts/app-layout';
import { type PageProps, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@headlessui/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categories', href: route('categories.index') },
    { title: 'Create', href: route('categories.create') },
];

export default function Create({ auth }: PageProps) {

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('categories.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Kategori" />
            <div className='p-3'>
                <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 border rounded-md">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="name">Nama Kategori</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            {errors.name && <p className="text-sm text-red-600 mt-2">{errors.name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="description">Deskripsi (Opsional)</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            {errors.description && <p className="text-sm text-red-600 mt-2">{errors.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                            <Link href={route('categories.index')}>
                                <Button type="button" variant="outline">Batal</Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}