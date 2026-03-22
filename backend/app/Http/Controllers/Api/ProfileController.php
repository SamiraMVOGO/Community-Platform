<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function index(Request $request)
    {
        $query = Profile::with('user', 'category', 'documents');

        if ($request->query) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->query . '%');
            });
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->education_level) {
            $query->where('education_level', $request->education_level);
        }

        if ($request->sector) {
            $query->where('sector', $request->sector);
        }

        if ($request->location) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        // Filter by municipality if provided
        if ($request->municipality_id) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('municipality_id', $request->municipality_id);
            });
        }

        $query->where('status', 'approved');

        return response()->json($query->paginate(15));
    }

    public function show($id)
    {
        $profile = Profile::with('user', 'category', 'documents')->findOrFail($id);
        return response()->json($profile);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'bio' => 'nullable|string',
            'skills' => 'nullable|string',
            'experience' => 'nullable|string',
            'education_level' => 'nullable|string',
            'sector' => 'nullable|string',
            'location' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        $profile = $request->user()->profile()->create($validated);

        return response()->json($profile, 201);
    }

    public function update(Request $request, $id)
    {
        $profile = Profile::findOrFail($id);

        if ($profile->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'bio' => 'nullable|string',
            'skills' => 'nullable|string',
            'experience' => 'nullable|string',
            'education_level' => 'nullable|string',
            'sector' => 'nullable|string',
            'location' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        $profile->update($validated);

        return response()->json($profile);
    }
}
