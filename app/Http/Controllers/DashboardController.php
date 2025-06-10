<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $products = Product::with('images')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($product) {
                $product->image_path = $product->images->first()->image_path ?? null;
                return $product;
            });

        return Inertia::render('dashboard', [
            'products' => $products,
            'customers' => Customer::all(), // <-- TAMBAHKAN INI
        ]);
    }

}
