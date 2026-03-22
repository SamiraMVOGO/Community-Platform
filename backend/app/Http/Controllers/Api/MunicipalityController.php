<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Municipality;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MunicipalityController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if ($request->user()->role !== 'super_admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return $next($request);
        });
    }

    // Get all municipalities
    public function index(Request $request)
    {
        $municipalities = Municipality::with(['mayor', 'agents'])
            ->when($request->search, function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            })
            ->paginate(15);

        return response()->json($municipalities);
    }

    // Create a new municipality
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:municipalities',
            'description' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        $municipality = Municipality::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'location' => $validated['location'] ?? null,
            'is_active' => true,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'created_municipality',
            'model' => 'Municipality',
            'model_id' => $municipality->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Municipality created successfully',
            'municipality' => $municipality,
        ], 201);
    }

    // Get a specific municipality
    public function show($id)
    {
        $municipality = Municipality::with(['mayor', 'agents', 'profiles'])
            ->findOrFail($id);

        return response()->json($municipality);
    }

    // Update a municipality
    public function update(Request $request, $id)
    {
        $municipality = Municipality::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|unique:municipalities,name,' . $id,
            'description' => 'nullable|string',
            'location' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $municipality->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'updated_municipality',
            'model' => 'Municipality',
            'model_id' => $id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Municipality updated successfully',
            'municipality' => $municipality,
        ]);
    }

    // Delete a municipality
    public function destroy(Request $request, $id)
    {
        $municipality = Municipality::findOrFail($id);
        $municipality->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'deleted_municipality',
            'model' => 'Municipality',
            'model_id' => $id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Municipality deleted successfully']);
    }

    // Create a mayor for a municipality
    public function createMayor(Request $request, $id)
    {
        $municipality = Municipality::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($municipality->mayor_id) {
            return response()->json(['message' => 'This municipality already has a mayor'], 400);
        }

        $mayor = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'mayor',
            'municipality_id' => $id,
            'is_active' => true,
        ]);

        $municipality->update(['mayor_id' => $mayor->id]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'created_mayor',
            'model' => 'User',
            'model_id' => $mayor->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Mayor created successfully',
            'mayor' => $mayor,
            'municipality' => $municipality,
        ], 201);
    }

    // Create a municipal agent for a municipality
    public function createAgent(Request $request, $id)
    {
        $municipality = Municipality::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $agent = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'agent_municipal',
            'municipality_id' => $id,
            'is_active' => true,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'created_agent',
            'model' => 'User',
            'model_id' => $agent->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Municipal agent created successfully',
            'agent' => $agent,
        ], 201);
    }

    // Get all users with specific role
    public function getUsersByRole(Request $request)
    {
        $validated = $request->validate([
            'role' => 'required|in:super_admin,mayor,agent_municipal,user,admin',
        ]);

        $users = User::where('role', $validated['role'])
            ->with('municipality')
            ->paginate(15);

        return response()->json($users);
    }

    // Get all agents in a municipality (for mayor)
    public function getMunicipalityAgents($id)
    {
        $municipality = Municipality::findOrFail($id);

        $agents = User::where('municipality_id', $id)
            ->where('role', 'agent_municipal')
            ->paginate(15);

        return response()->json($agents);
    }

    // Remove mayor from municipality
    public function removeMayor(Request $request, $id)
    {
        $municipality = Municipality::findOrFail($id);

        if (!$municipality->mayor_id) {
            return response()->json(['message' => 'This municipality does not have a mayor'], 400);
        }

        $mayor = User::find($municipality->mayor_id);
        $municipality->update(['mayor_id' => null]);
        $mayor->update(['role' => 'user', 'municipality_id' => null]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'removed_mayor',
            'model' => 'Municipality',
            'model_id' => $id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Mayor removed from municipality']);
    }

    // Remove an agent from municipality
    public function removeAgent(Request $request, $agentId)
    {
        $agent = User::where('role', 'agent_municipal')->findOrFail($agentId);

        $agent->update(['role' => 'user', 'municipality_id' => null]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'removed_agent',
            'model' => 'User',
            'model_id' => $agentId,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Agent removed from municipality']);
    }
}
