<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\PlayLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_devices' => Device::count(),
            'online_devices' => Device::all()->filter->is_online->count(),
            'logs_today' => PlayLog::whereDate('played_at', today())->count(),
            'top_input' => PlayLog::select('input_name', DB::raw('count(*) as total'))
                ->groupBy('input_name')
                ->orderByDesc('total')
                ->first()?->input_name ?? 'N/A',
        ];

        $chartData = PlayLog::select(DB::raw('strftime("%H", played_at) as hour'), DB::raw('count(*) as count'))
            ->where('played_at', '>=', now()->subDay())
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(function ($row) {
                return [
                    'label' => $row->hour . ':00',
                    'count' => $row->count,
                ];
            });

        $recentLogs = PlayLog::with('device')
            ->orderByDesc('played_at')
            ->limit(10)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'chart_data' => $chartData,
            'recent_logs' => $recentLogs,
            'devices' => Device::all(),
        ]);
    }
}
