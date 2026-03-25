<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        $query = Profile::with('user.municipality', 'category', 'documents')
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

        $profiles = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($profiles);
    }

    public function approveProfile(Request $request, $id)
    {
        $profile = Profile::with('user')->findOrFail($id);
        $wasAgentCandidate = $profile->user && $profile->user->role === 'agent_pending';
        $profile->update(['status' => 'approved']);

        if ($wasAgentCandidate) {
            $profile->user->update(['role' => 'agent_municipal']);
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => $wasAgentCandidate
                ? 'approved_agent_candidate'
                : 'approved_profile',
            'model' => 'Profile',
            'model_id' => $id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Profile approved', 'profile' => $profile]);
    }

    public function rejectProfile(Request $request, $id)
    {
        $profile = Profile::with('user')->findOrFail($id);
        $wasAgentCandidate = $profile->user && $profile->user->role === 'agent_pending';
        $profile->update(['status' => 'rejected']);

        if ($wasAgentCandidate) {
            $profile->user->update(['role' => 'user']);
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => $wasAgentCandidate
                ? 'rejected_agent_candidate'
                : 'rejected_profile',
            'model' => 'Profile',
            'model_id' => $id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Profile rejected']);
    }

    public function users()
    {
        $user = auth()->user();
        $query = User::with(['municipality', 'creator']);

        // If municipal agent or mayor, only show users from their municipality
        if ($user->role === 'agent_municipal' && $user->municipality_id) {
            $query->where('municipality_id', $user->municipality_id)
                ->where(function ($q) use ($user) {
                    $q->where('created_by', $user->id)
                        ->orWhere('id', $user->id);
                });
        } elseif ($user->role === 'mayor' && $user->municipality_id) {
            $query->where('municipality_id', $user->municipality_id);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);
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
        if (!in_array(auth()->user()->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $logs = ActivityLog::with('user')->latest()->paginate(30);
        return response()->json($logs);
    }

    public function exportUsersCsv(Request $request): StreamedResponse
    {
        $authUser = $request->user();
        $query = User::with('municipality');

        if (in_array($authUser->role, ['mayor', 'agent_municipal']) && $authUser->municipality_id) {
            $query->where('municipality_id', $authUser->municipality_id);
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        return response()->streamDownload(function () use ($users) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id', 'name', 'email', 'role', 'municipality', 'active', 'created_at']);

            foreach ($users as $user) {
                fputcsv($handle, [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->role,
                    optional($user->municipality)->name,
                    $user->is_active ? 'yes' : 'no',
                    optional($user->created_at)->toDateTimeString(),
                ]);
            }

            fclose($handle);
        }, 'users_export.csv', ['Content-Type' => 'text/csv']);
    }

    public function exportProfilesCsv(Request $request): StreamedResponse
    {
        $authUser = $request->user();
        $query = Profile::with(['user', 'category']);

        if (in_array($authUser->role, ['mayor', 'agent_municipal']) && $authUser->municipality_id) {
            $query->whereHas('user', function ($q) use ($authUser) {
                $q->where('municipality_id', $authUser->municipality_id);
            });
        }

        $profiles = $query->orderBy('created_at', 'desc')->get();

        return response()->streamDownload(function () use ($profiles) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'id',
                'user_name',
                'user_email',
                'category',
                'sector',
                'education_level',
                'location',
                'phone',
                'status',
                'created_at',
            ]);

            foreach ($profiles as $profile) {
                fputcsv($handle, [
                    $profile->id,
                    optional($profile->user)->name,
                    optional($profile->user)->email,
                    optional($profile->category)->name,
                    $profile->sector,
                    $profile->education_level,
                    $profile->location,
                    $profile->phone,
                    $profile->status,
                    optional($profile->created_at)->toDateTimeString(),
                ]);
            }

            fclose($handle);
        }, 'profiles_export.csv', ['Content-Type' => 'text/csv']);
    }
}
