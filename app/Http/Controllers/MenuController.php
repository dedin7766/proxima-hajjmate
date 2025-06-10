<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Menu;

class MenuController extends Controller
{

    public function index()
    {
        $menus = Menu::with('items.children')->get();
        return inertia('Admin/Menu/Index', [
            'menus' => $menus,
        ]);
    }

}
