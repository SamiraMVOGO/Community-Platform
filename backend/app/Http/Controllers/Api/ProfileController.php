<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function downloadDocument($id)
    {
        $document = Document::findOrFail($id);
        $path = $this->resolveExistingDocumentPath($document->path);

        if (!$path) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        $downloadName = $document->original_name ?: basename($path);
        return Storage::disk('public')->download($path, $downloadName);
    }

    public function me(Request $request)
    {
        $profile = Profile::with('user', 'category', 'documents')
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        return response()->json($profile);
    }

    public function index(Request $request)
    {
        $query = Profile::with('user', 'category', 'documents');

        // Public listing must only include complete profiles linked to a user and category.
        $query->whereHas('user')->whereHas('category');

        if ($request->query('query')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->query('query') . '%');
            });
        }

        if ($request->query('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        if ($request->query('education_level')) {
            $query->where('education_level', $request->query('education_level'));
        }

        if ($request->query('sector')) {
            $query->where('sector', $request->query('sector'));
        }

        if ($request->query('location')) {
            $query->where('location', 'like', '%' . $request->query('location') . '%');
        }

        // Filter by municipality if provided
        if ($request->query('municipality_id')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('municipality_id', $request->query('municipality_id'));
            });
        }

        $sortBy = $request->query('sort_by', 'created_at');
        $sortDirection = $request->query('sort_direction', 'desc');
        if (in_array($sortBy, ['created_at', 'education_level', 'sector'])) {
            $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $query->where('status', 'approved');

        return response()->json($query->paginate((int) $request->query('per_page', 15)));
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
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            'legal_document' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
        ]);

        $profile = $request->user()->profile()->create($validated);

        $this->storeDocumentIfPresent($request, $profile, 'cv', 'cv');
        $this->storeDocumentIfPresent($request, $profile, 'photo', 'photo');
        $this->storeDocumentIfPresent($request, $profile, 'legal_document', 'legal');

        return response()->json($profile->load('documents'), 201);
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
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            'legal_document' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
        ]);

        $profile->update($validated);

        $this->storeDocumentIfPresent($request, $profile, 'cv', 'cv');
        $this->storeDocumentIfPresent($request, $profile, 'photo', 'photo');
        $this->storeDocumentIfPresent($request, $profile, 'legal_document', 'legal');

        return response()->json($profile->load('documents'));
    }

    private function storeDocumentIfPresent(Request $request, Profile $profile, string $requestKey, string $type): void
    {
        if (!$request->hasFile($requestKey)) {
            return;
        }

        $file = $request->file($requestKey);
        $path = $file->store("profiles/{$profile->id}", 'public');

        Document::where('profile_id', $profile->id)
            ->where('type', $type)
            ->get()
            ->each(function (Document $document) {
                if ($document->path) {
                    Storage::disk('public')->delete($document->path);
                }
                $document->delete();
            });

        Document::create([
            'profile_id' => $profile->id,
            'type' => $type,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
        ]);
    }

    private function resolveExistingDocumentPath(?string $rawPath): ?string
    {
        if (!$rawPath) {
            return null;
        }

        $normalized = ltrim(str_replace('\\', '/', $rawPath), '/');
        $candidates = [
            $normalized,
            preg_replace('/^public\//', '', $normalized),
            preg_replace('/^storage\//', '', $normalized),
        ];

        foreach (array_filter(array_unique($candidates)) as $candidate) {
            if (Storage::disk('public')->exists($candidate)) {
                return $candidate;
            }
        }

        return null;
    }
}
