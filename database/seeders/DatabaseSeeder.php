<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        Menu::create(['name' => 'Main Menu', 'location' => 'sidebar'])->items()->createMany([
            ['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutGrid', 'order' => 1],
            ['title' => 'Users', 'href' => '/users', 'icon' => 'Users', 'order' => 2],
        ]);

    }
}
