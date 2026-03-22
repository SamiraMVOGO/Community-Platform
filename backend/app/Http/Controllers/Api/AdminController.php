<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = $request->user();
            // Allow super_admin, admin, mayor, and agent_municipal with appropriate access
            if (!in_array($user->role, ['super_admin', 'admin', 'mayor', 'agent_municipal'])) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return $next($request);
        });
    }

    public function pendingProfiles()
    {
        $user = auth()->user();
        $query = Profile::with('user', 'category')
            ->where('status', 'pending');

        // If municipal agent, only show profiles from their municipality
        if ($user->role === 'agent_municipal' && $user->municipality_id) {
            $query->whereHas('user', function ($q) use ($user) {
                $q->where('municipality_id', $user->municipality_id);
            });
        } elseif ($user->role === 'mayor' && $user->municipality_id) {
            $query->whereHas('user', function ($q) use ($user) {
                $q->where('municipality_id', $user->municipality_id);
            });
        }

        $profiles = $query->paginate(15);

        return response()->json($profiles);
    }

    public function approveProfile(Request $request, $id)
    {
        $profile = Profile::findOrFail($id);
        $profile->update(['status' => 'approved']);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'approved_profile',
            'model' => 'Profile',
            'model_id' => $id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Profile approved', 'profile' => $profile]);
    }

    public function rejectProfile(Request $request, $id)
    {
        $profile = Profile::findOrFail($id);
        $profile->update(['status' => 'rejected']);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'rejected_profile',
            'model' => 'Profile',
            'model_id' => $id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Profile rejected']);
    }

    public function users()
    {
        $user = auth()->user();
        $query = User::with('municipality');

        // If municipal agent or mayor, only show users from their municipality
        if ($user->role === 'agent_municipal' && $user->municipality_id) {
            $query->where('municipality_id', $user->municipality_id);
        } elseif ($user->role === 'mayor' && $user->municipality_id) {
            $query->where('municipality_id', $user->municipality_id);
        }

        $users = $query->paginate(15);
        return response()->json($users);
    }

    public function toggleUserStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);

        return response()->json(['message' => 'User status updated', 'user' => $user]);
    }

    public function activityLogs()
    {
        $logs = ActivityLog::with('user')->latest()->paginate(30);
        return response()->json($logs);
    }
}
