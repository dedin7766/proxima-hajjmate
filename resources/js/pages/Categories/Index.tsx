import AppLayout from '@/layouts/app-layout';
import { type PageProps, type PaginatedResponse, type Category, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { can } from '@/lib/can';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/categories',
    },
];

export default function Index({ auth, categories, flash }: PageProps<{ categories: PaginatedResponse<Category> }>) {

    const [isFlashVisible, setIsFlashVisible] = useState(false);
    
    const handleDelete = (id: number) => {
        if(confirm("Apakah Anda yakin ingin menghapus kategori ini? Semua produk terkait juga bisa terpengaruh.")){
            router.delete(route('categories.destroy', id));
        }
    }

    useEffect(() => {
        // Jika ada pesan flash.success
        if (flash.success) {
            // Tampilkan notifikasi
            setIsFlashVisible(true);

            // Set timer untuk menyembunyikan notifikasi setelah 3 detik (3000ms)
            const timer = setTimeout(() => {
                setIsFlashVisible(false);
            }, 3000);

            // Bersihkan timer jika komponen di-unmount sebelum waktu habis
            return () => clearTimeout(timer);
        }
    }, [flash.success]); // Jalankan efek ini hanya ketika flash.success berubah


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            {isFlashVisible && flash.success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
                    <p>{flash.success}</p>
                </div>
            )}

            <div className='p-3'>
               {can('categories.create') && ( // Asumsi Anda punya sistem permission
                 <Link href={route('categories.create')}>
                     <Button variant="outline" size="sm">
                         <Plus className="mr-2 h-4 w-4" /> Create
                     </Button>
                 </Link>
               )}

                <div className="overflow-x-auto mt-3 border rounded-md">
                    <Table>
                        <TableCaption>List of categories products.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.data.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.id}</TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{category.description}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={route('categories.edit', category.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                        <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4">
                    {categories.links.map((link, index) => (
                     link.url ? (
                        <Link
                            key={index}
                            href={link.url}
                            className={`px-3 py-1 border rounded ${link.active ? 'bg-indigo-500 text-white' : 'bg-white'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                     ) : (
                        <span
                            key={index}
                            className="px-3 py-1 border rounded text-gray-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                     )
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}