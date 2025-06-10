import AppLayout from '@/layouts/app-layout';
import { type PageProps, type PaginatedResponse, type Product, type BreadcrumbItem } from '@/types';
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
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: route('products.index'),
    },
];

export default function Index({ auth, products, flash }: PageProps<{ products: PaginatedResponse<Product> }>) {

    const [isFlashVisible, setIsFlashVisible] = useState(false);

    const handleDelete = (id: number) => {
        if(confirm("Are you sure you want to remove this product?")){
            router.delete(route('products.destroy', id));
        }
    }

    const [showModal, setShowModal] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');

    const openModal = (src: string) => {
    setModalImageSrc(src);
    setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalImageSrc('');
    };


    useEffect(() => {
        // Tambahkan ?. untuk keamanan
        if (flash?.success) {
            setIsFlashVisible(true);
            const timer = setTimeout(() => setIsFlashVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            {isFlashVisible && flash?.success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
                    <p>{flash.success}</p>
                </div>
            )}
            
            <div className='p-3'>
                {/* Tambahkan ?. pada auth.user untuk keamanan saat user belum login */}
                
                {can('users.create') && (
                    <Link href={route('products.create')}>
                        <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Create
                        </Button>
                    </Link>
                )}

                <div className="overflow-x-auto mt-3 border rounded-md">
                    <Table>
                        <TableCaption>A list of your products.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Barcode</TableHead>
                                <TableHead className="w-[100px]">SKU</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* INI BAGIAN PALING PENTING: Tambahkan ?. pada products.data */}
                            {products?.data?.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {product.sku && (
                                            <div className="flex flex-col items-center">
                                                {/* Klik untuk zoom menggunakan modal */}
                                                    <img
                                                        src={route('products.barcode', product.id)}
                                                        alt={`Barcode for ${product.name}`}
                                                        className="w-32 bg-white p-2 rounded cursor-pointer hover:scale-105 transition"
                                                        onClick={() => openModal(route('products.barcode', product.id))}
                                                    />

                                                {/* Tombol download */}
                                                <a
                                                    href={route('products.barcode.download', product.id)}
                                                    className="text-xs text-blue-600 hover:underline mt-1"
                                                    download
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{product.sku}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.category?.name}</TableCell>
                                    <TableCell>Rp {Number(product.price).toLocaleString('id-ID')}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={route('products.edit', product.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                    {/* Pagination */}
                    <div className="mt-4">
                        {/* Tambahkan ?. pada products.links */}
                        {products?.links?.map((link, index) => (
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
                 {showModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
                        onClick={closeModal}
                    >
                        <div
                            className="bg-white p-4 rounded shadow-lg max-w-lg w-full relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeModal}
                                className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl font-bold"
                            >
                              
                            </button>
                            <img src={modalImageSrc} alt="Zoomed Barcode" className="w-full h-auto" />
                        </div>
                    </div>
                )}
        </AppLayout>
    );
}