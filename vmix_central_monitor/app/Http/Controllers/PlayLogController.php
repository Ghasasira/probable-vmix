<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\PlayLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlayLogController extends Controller
{
    public function index(Request $request)
    {
        $query = PlayLog::query()->with('device');

        if ($request->device_id) {
            $query->where('device_id', $request->device_id);
        }

        if ($request->input_name) {
            $query->where('input_name', 'like', '%' . $request->input_name . '%');
        }

        if ($request->input_type) {
            $query->where('input_type', $request->input_type);
        }

        if ($request->date_from) {
            $query->where('played_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->where('played_at', '<=', $request->date_to);
        }

        $logs = $query->orderByDesc('played_at')
            ->paginate(100)
            ->withQueryString();

        return Inertia::render('logs/index', [
            'logs' => $logs,
            'filters' => $request->only(['device_id', 'input_name', 'input_type', 'date_from', 'date_to']),
            'devices' => Device::select('id', 'machine_name', 'display_name')->get(),
            'types' => PlayLog::distinct('input_type')->pluck('input_type')->filter(),
        ]);
    }
}
