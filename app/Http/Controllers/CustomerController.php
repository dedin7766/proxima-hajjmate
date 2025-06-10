<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;


class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // app/Http/Controllers/CustomerController.php
    public function index()
    {
        $customers = Customer::latest()->paginate(10);
        return inertia('Customers/Index', ['customers' => $customers]);
    }

    /**
     * Show the form for creating a new resource.
     */
    // app/Http/Controllers/CustomerController.php
    public function create()
    {
        return inertia('Customers/Create');
    }

    public function store(Request $request)
    {
        // 1. Validasi semua data yang masuk dari form
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'nik' => 'required|string|size:16|unique:customers,nik',
            'tempat_lahir' => 'nullable|string|max:255',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => ['nullable', 'string', Rule::in(['LAKI-LAKI', 'PEREMPUAN'])],
            'address' => 'nullable|string',
            'rt' => 'nullable|string|max:3',
            'rw' => 'nullable|string|max:3',
            'kel_desa' => 'nullable|string|max:255',
            'kecamatan' => 'nullable|string|max:255',
            'agama' => 'nullable|string|max:50',
            'status_perkawinan' => ['nullable', 'string', Rule::in(['BELUM KAWIN', 'KAWIN', 'CERAI HIDUP', 'CERAI MATI'])],
            'pekerjaan' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20',
            'ktp_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Ini adalah file dari form
        ]);

        // 2. Proses file upload jika ada
        if ($request->hasFile('ktp_photo')) {
            // Simpan file dan dapatkan path-nya.
            $path = $request->file('ktp_photo')->store('ktp_photos', 'public');
            
            // Tambahkan path ke dalam data yang sudah divalidasi dengan nama kolom yang benar
            $validatedData['ktp_image_path'] = $path;
        }

        // 3. Hapus key 'ktp_photo' karena tidak ada kolomnya di DB
        unset($validatedData['ktp_photo']);

        // 4. Buat customer dengan data yang sudah siap
        Customer::create($validatedData);

        return redirect()->route('customers.index')->with('success', 'Customer created successfully.');
    }
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();
        
        // Redirect back ke halaman sebelumnya atau ke index
        return Redirect::back()->with('success', 'Produk berhasil dihapus.');
    }
}
