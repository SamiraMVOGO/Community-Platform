<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StatisticController extends Controller
{
    public function dashboard()
    {
        $totalUsers = User::count();
        $totalProfiles = Profile::count();
        $approvedProfiles = Profile::where('status', 'approved')->count();
        $pendingProfiles = Profile::where('status', 'pending')->count();
        $rejectedProfiles = Profile::where('status', 'rejected')->count();

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
        $data = Profile::select('category_id')
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
        $data = Profile::select('sector')
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
        $data = User::select(DB::raw('DATE(created_at) as date'))
            ->selectRaw('count(*) as count')
            ->groupBy('date')
            ->latest('date')
            ->limit(30)
            ->get();

        return response()->json($data);
    }
}
