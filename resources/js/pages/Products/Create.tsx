import AppLayout from '@/layouts/app-layout';
import { type PageProps, type BreadcrumbItem, type Category } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@headlessui/react';

// Breadcrumbs definition for navigation
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: route('products.index') },
    { title: 'Create', href: route('products.create') },
];

// Helper function to format number with dots
const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID').format(number);
}

// Main component
export default function Create({ auth, categories }: PageProps<{ categories: Category[] }>) {

    // useForm hook from Inertia to manage form state
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        sku: '',
        category_id: '',
        price: 0,
        stock: 0,
        description: '',
        images: null as FileList | null, // Correctly type the images property
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Inertia's post method handles FormData automatically when there are files.
        // We don't need to manually build FormData if we let Inertia do it.
        post(route('products.store'), {
            forceFormData: true, // Ensure it always uses FormData
        });
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Product" />

            <div className='p-3'>
                <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 border rounded-md">
                    <h2 className="text-lg font-medium text-900 mb-6">Add New Product Form</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Product Name */}
                        <div>
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="e.g. Awesome T-Shirt"
                            />
                            {errors.name && <p className="text-sm text-red-600 mt-2">{errors.name}</p>}
                        </div>

                        {/* SKU */}
                        <div>
                            <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                            <Input
                                id="sku"
                                type="text"
                                value={data.sku}
                                onChange={e => setData('sku', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="e.g. TSHIRT-RED-M"
                            />
                            {errors.sku && <p className="text-sm text-red-600 mt-2">{errors.sku}</p>}
                        </div>
                        
                        {/* Category */}
                        <div>
                             <Label htmlFor="category_id">Category</Label>
                             <Select onValueChange={(value) => setData('category_id', value)} value={data.category_id}>
                                 <SelectTrigger className="w-full mt-1">
                                     <SelectValue placeholder="Select a Product Category" />
                                 </SelectTrigger>
                                 <SelectContent>
                                     {categories.map(category => (
                                         <SelectItem key={category.id} value={category.id.toString()}>
                                             {category.name}
                                         </SelectItem>
                                     ))}
                                 </SelectContent>
                             </Select>
                             {errors.category_id && <p className="text-sm text-red-600 mt-2">{errors.category_id}</p>}
                        </div>

                        {/* Price */}
                        <div>
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="text" // Change to text to allow formatting
                                inputMode="numeric" // Keep numeric keyboard on mobile
                                value={formatRupiah(data.price)}
                                onChange={e => {
                                    // Remove all non-digit characters to get the raw number
                                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                    setData('price', Number(rawValue));
                                }}
                                onFocus={e => e.target.select()} // Select text on focus
                                className="mt-1 block w-full"
                                placeholder="e.g. 150.000"
                            />
                            {errors.price && <p className="text-sm text-red-600 mt-2">{errors.price}</p>}
                        </div>

                        {/* Stock */}
                        <div>
                            <Label htmlFor="stock">Initial Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={data.stock}
                                onChange={e => setData('stock', Number(e.target.value))}
                                onFocus={e => e.target.select()} // Select text on focus
                                className="mt-1 block w-full"
                                placeholder="e.g. 100"
                            />
                            {errors.stock && <p className="text-sm text-red-600 mt-2">{errors.stock}</p>}
                        </div>
                        
                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="mt-1 block w-full" // shadcn/ui Textarea uses className
                                placeholder="A brief description of the product..."
                            />
                            {errors.description && <p className="text-sm text-red-600 mt-2">{errors.description}</p>}
                        </div>

                        {/* Images Upload */}
                        <div>
                            <Label htmlFor="images">Product Images</Label>
                            <Input
                                id="images"
                                type="file"
                                multiple
                                accept="image/*"
                                // Inertia's useForm handles file inputs directly
                                onChange={e => setData('images', e.target.files)}
                                className="mt-1 block w-full"
                            />
                            {errors.images && <p className="text-sm text-red-600 mt-2">{errors.images}</p>}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Product'}
                            </Button>
                            <Link href={route('products.index')}>
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}