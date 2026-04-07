<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\PlayLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class IngestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'machine_name' => 'required|string',
            'data' => 'required|array',
            'data.*.played_at' => 'required',
            'data.*.input_number' => 'required|integer',
            'data.*.input_name' => 'required|string',
        ]);

        $device = Device::updateOrCreate(
            ['machine_name' => $validated['machine_name']],
            [
                'last_seen_at' => now(),
                'last_input_name' => collect($validated['data'])->last()['input_name'] ?? null,
            ]
        );

        $logs = collect($validated['data'])->map(function ($item) use ($device) {
            return [
                'device_id' => $device->id,
                'input_number' => $item['input_number'],
                'input_name' => $item['input_name'],
                'input_type' => $item['input_type'] ?? null,
                'played_at' => Carbon::parse($item['played_at'])->toDateTimeString(),
                'duration_ms' => $item['duration_ms'] ?? 0,
                'position_ms' => $item['position_ms'] ?? 0,
                'screenshot_path' => $item['screenshot_path'] ?? null,
                'source' => $item['source'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        // Use upsert to handle deduplication efficiently
        PlayLog::upsert(
            $logs,
            ['device_id', 'played_at', 'input_number'],
            ['input_name', 'input_type', 'duration_ms', 'position_ms', 'screenshot_path', 'source', 'updated_at']
        );

        return response()->json([
            'status' => 'success',
            'message' => count($logs) . ' logs processed for ' . $device->machine_name,
        ]);
    }
}
