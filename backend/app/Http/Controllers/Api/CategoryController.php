<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with(['profiles' => function ($q) {
            $q->where('status', 'approved');
        }])->get();

        return response()->json($categories);
    }

    public function show($id)
    {
        $category = Category::with(['profiles' => function ($q) {
            $q->where('status', 'approved');
        }])->findOrFail($id);

        return response()->json($category);
    }
}
