<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    private function authorizeNewsManager(Request $request): void
    {
        $role = $request->user()?->role;

        if (!in_array($role, ['super_admin', 'admin', 'mayor'])) {
            abort(403, 'Unauthorized');
        }
    }

    public function index()
    {
        $news = News::where('is_active', true)
            ->latest('published_at')
            ->paginate(10);

        return response()->json($news);
    }

    public function show($id)
    {
        $news = News::findOrFail($id);
        return response()->json($news);
    }

    public function store(Request $request)
    {
        $this->authorizeNewsManager($request);

        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'published_at' => 'nullable|datetime',
        ]);

        $news = News::create([
            ...$validated,
            'author_id' => $request->user()->id,
        ]);

        return response()->json($news, 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeNewsManager($request);

        $news = News::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $news->update($validated);

        return response()->json($news);
    }

    public function destroy(Request $request, $id)
    {
        $this->authorizeNewsManager($request);

        News::findOrFail($id)->delete();
        return response()->json(['message' => 'News deleted']);
    }
}
