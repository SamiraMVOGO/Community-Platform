<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoginHistory;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'requested_role' => ['nullable', Rule::in(['user', 'agent_municipal'])],
            'municipality_id' => ['nullable', 'integer', Rule::exists('municipalities', 'id')],
        ]);

        $requestedRole = $validated['requested_role'] ?? 'user';

        if ($requestedRole === 'agent_municipal' && empty($validated['municipality_id'])) {
            return response()->json([
                'message' => 'La commune est obligatoire pour une candidature agent municipal.',
            ], 422);
        }

        $assignedRole = $requestedRole === 'agent_municipal' ? 'agent_pending' : 'user';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $assignedRole,
            'municipality_id' => $validated['municipality_id'] ?? null,
        ]);

        return response()->json([
            'message' => $assignedRole === 'agent_pending'
                ? 'Candidature agent municipal soumise. Validation en attente du super admin.'
                : 'User created successfully',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Account is inactive'], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        LoginHistory::create([
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'logged_in_at' => now(),
        ]);

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('profile.category'));
    }

    public function logout(Request $request)
    {
        LoginHistory::where('user_id', $request->user()->id)
            ->whereNull('logged_out_at')
            ->latest('logged_in_at')
            ->limit(1)
            ->update(['logged_out_at' => now()]);

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function loginHistory(Request $request)
    {
        $history = LoginHistory::where('user_id', $request->user()->id)
            ->latest('logged_in_at')
            ->paginate(20);

        return response()->json($history);
    }

    public function registerByAgent(Request $request)
    {
        $actor = $request->user();

        if (!in_array($actor->role, ['super_admin', 'admin', 'mayor', 'agent_municipal'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (in_array($actor->role, ['mayor', 'agent_municipal']) && !$actor->municipality_id) {
            return response()->json(['message' => 'Municipality is required for this account'], 422);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'bio' => 'nullable|string',
            'skills' => 'nullable|string',
            'experience' => 'nullable|string',
            'education_level' => 'nullable|string',
            'sector' => 'nullable|string',
            'location' => 'nullable|string',
            'municipality_id' => [
                'nullable',
                'integer',
                Rule::exists('municipalities', 'id'),
            ],
        ]);

        $municipalityId = $actor->municipality_id;

        if (in_array($actor->role, ['super_admin', 'admin']) && !empty($validated['municipality_id'])) {
            $municipalityId = $validated['municipality_id'];
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user',
            'municipality_id' => $municipalityId,
            'created_by' => $actor->id,
            'is_active' => true,
        ]);

        $profile = Profile::create([
            'user_id' => $user->id,
            'category_id' => $validated['category_id'],
            'bio' => $validated['bio'] ?? null,
            'skills' => $validated['skills'] ?? null,
            'experience' => $validated['experience'] ?? null,
            'education_level' => $validated['education_level'] ?? null,
            'sector' => $validated['sector'] ?? null,
            'location' => $validated['location'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'User registered successfully by agent',
            'user' => $user,
            'profile' => $profile,
        ], 201);
    }
}
