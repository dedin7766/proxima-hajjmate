<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia; // <-- Import Inertia
use Illuminate\Support\Facades\Redirect; // <-- Import Redirect
use Milon\Barcode\DNS1D;
use Illuminate\Support\Facades\Storage;
use App\Models\ProductImage;

class ProductController extends Controller
{
    /**
     * Menampilkan daftar semua produk.
     */
    public function index()
    {
        // Data yang dikirim sebagai props ke komponen React
        $products = Product::with('category')->latest()->paginate(10);
        return Inertia::render('Products/Index', [
            'products' => $products
        ]);
    }

    public function generateBarcode(Product $product)
    {
        if (!$product->sku) {
            abort(404, 'SKU tidak ditemukan untuk produk ini.');
        }

        $generator = new DNS1D();
        $base64 = $generator->getBarcodePNG($product->sku, 'C128', 2, 60, [0, 0, 0]);

        $imageData = base64_decode($base64);

        return response($imageData, 200)->header('Content-Type', 'image/png');
    }

    public function downloadBarcode(Product $product)
    {
        if (!$product->sku) {
            abort(404, 'SKU tidak ditemukan.');
        }

        $generator = new DNS1D();
        $base64 = $generator->getBarcodePNG($product->sku, 'C128', 2, 60, [0, 0, 0]);

        $imageData = base64_decode($base64);
        $fileName = 'barcode_' . $product->sku . '.png';

        return response($imageData)
            ->header('Content-Type', 'image/png')
            ->header('Content-Disposition', "attachment; filename=\"$fileName\"");
    }
        
    /**
     * Menampilkan halaman/komponen form untuk membuat produk baru.
     */
    public function create()
    {
        return Inertia::render('Products/Create', [
            'categories' => Category::all()
        ]);
    }

    /**
     * Menyimpan produk baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:200',
            'sku' => 'required|string|unique:products,sku',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:2048', // validasi multiple images
        ]);

        $product = Product::create($validated);

        // Simpan gambar jika ada
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                ]);
            }
        }

        return Redirect::route('products.index')->with('success', 'Produk berhasil ditambahkan.');
    }
    /**
     * Menampilkan halaman/komponen untuk mengedit produk.
     * (Method 'show' sering tidak digunakan di CRUD Inertia karena detail bisa ditampilkan di modal pada halaman index)
     */
    public function edit(Product $product)
    {
        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => Category::all()
        ]);
    }

    /**
     * Memperbarui data produk di database.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:200',
            'sku' => 'required|string|unique:products,sku,' . $product->id,
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $product->update($validated);

        return Redirect::route('products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    /**
     * Menghapus produk dari database.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        
        // Redirect back ke halaman sebelumnya atau ke index
        return Redirect::back()->with('success', 'Produk berhasil dihapus.');
    }

}