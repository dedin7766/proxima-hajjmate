<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Daftar semua permission
        $permissions = [
            // Users
            "users.view",
            "users.create",
            "users.edit",
            "users.delete",

            // Roles
            "roles.view",
            "roles.create",
            "roles.edit",
            "roles.delete",

            // Products
            "products.view",
            "products.create",
            "products.edit",
            "products.delete",

            // Categories
            "categories.view",
            "categories.create",
            "categories.edit",
            "categories.delete",

            // Customers
            "customers.view",
            "customers.create",
            "customers.edit",
            "customers.delete",

            // Tambahkan permission lain di sini jika perlu
            // Contoh: "transactions.view"
        ];

        // Buat permission dari array di atas
        foreach ($permissions as $permission) {
            Permission::create(["name" => $permission]);
        }
    }
}