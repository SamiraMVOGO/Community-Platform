<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class StatisticController extends Controller
{
    private function municipalityScopedProfileQuery(): Builder
    {
        $query = Profile::query();
        $user = auth()->user();

        if ($user && in_array($user->role, ['mayor', 'agent_municipal']) && $user->municipality_id) {
            $query->whereHas('user', function (Builder $q) use ($user) {
                $q->where('municipality_id', $user->municipality_id);
            });
        }

        return $query;
    }

    private function municipalityScopedUserQuery(): Builder
    {
        $query = User::query();
        $user = auth()->user();

        if ($user && in_array($user->role, ['mayor', 'agent_municipal']) && $user->municipality_id) {
            $query->where('municipality_id', $user->municipality_id);
        }

        return $query;
    }

    public function dashboard()
    {
        $totalUsers = $this->municipalityScopedUserQuery()->count();
        $profileQuery = $this->municipalityScopedProfileQuery();
        $totalProfiles = (clone $profileQuery)->count();
        $approvedProfiles = (clone $profileQuery)->where('status', 'approved')->count();
        $pendingProfiles = (clone $profileQuery)->where('status', 'pending')->count();
        $rejectedProfiles = (clone $profileQuery)->where('status', 'rejected')->count();

        return response()->json([
            'totalUsers' => $totalUsers,
            'totalProfiles' => $totalProfiles,
            'approvedProfiles' => $approvedProfiles,
            'pendingProfiles' => $pendingProfiles,
            'rejectedProfiles' => $rejectedProfiles,
        ]);
    }

    public function profilesByCategory()
    {
        $data = $this->municipalityScopedProfileQuery()
            ->select('category_id')
            ->selectRaw('count(*) as count')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category->name,
                    'value' => $item->count,
                ];
            });

        return response()->json($data);
    }

    public function profilesBySector()
    {
        $data = $this->municipalityScopedProfileQuery()
            ->select('sector')
            ->selectRaw('count(*) as count')
            ->where('status', 'approved')
            ->groupBy('sector')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->sector,
                    'value' => $item->count,
                ];
            });

        return response()->json($data);
    }

    public function monthlyGrowth()
    {
        $data = $this->municipalityScopedUserQuery()
            ->select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"))
            ->selectRaw('count(*) as count')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        return response()->json($data);
    }

    public function profilesByEducation()
    {
        $data = $this->municipalityScopedProfileQuery()
            ->select('education_level')
            ->selectRaw('count(*) as count')
            ->where('status', 'approved')
            ->whereNotNull('education_level')
            ->groupBy('education_level')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->education_level,
                    'value' => $item->count,
                ];
            });

        return response()->json($data);
    }
}
