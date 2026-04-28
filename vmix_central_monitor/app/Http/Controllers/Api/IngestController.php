<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\PlayLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class IngestController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'machine_name' => 'required|string',
            'data'         => 'required|string', // JSON string (multipart can't send nested arrays)
        ]);

        $machineName = $request->input('machine_name');
        $data = json_decode($request->input('data'), true);

        if (!is_array($data) || empty($data)) {
            return response()->json(['status' => 'error', 'message' => 'Invalid or empty data payload.'], 422);
        }

        // Upsert device
        $device = Device::updateOrCreate(
            ['machine_name' => $machineName],
            [
                'last_seen_at'     => now(),
                'last_input_name'  => collect($data)->last()['input_name'] ?? null,
            ]
        );

        // Save any screenshots that arrived in this request
        // Each screenshot field is named "screenshot_{log_id}" matching the agent's DB id
        $screenshotMap = []; // [ agent_log_id => stored_path ]

        foreach ($request->allFiles() as $fieldName => $file) {
            if (!str_starts_with($fieldName, 'screenshot_')) continue;

            $agentLogId = (int) str_replace('screenshot_', '', $fieldName);
            $filename   = $file->getClientOriginalName();
            $path       = $file->storeAs("screenshots/{$machineName}", $filename, 'public');

            $screenshotMap[$agentLogId] = $path;
        }

        // Build log rows, substituting the stored screenshot path where available
        $logs = collect($data)->map(function ($item) use ($device, $screenshotMap) {
            $agentId       = $item['id'] ?? null;
            $screenshotPath = $screenshotMap[$agentId] ?? ($item['screenshot_path'] ?? null);

            return [
                'device_id'       => $device->id,
                'input_number'    => $item['input_number'],
                'input_name'      => $item['input_name'],
                'input_type'      => $item['input_type'] ?? null,
                'played_at'       => Carbon::parse($item['played_at'])->toDateTimeString(),
                'duration_ms'     => $item['duration_ms'] ?? 0,
                'position_ms'     => $item['position_ms'] ?? 0,
                'screenshot_path' => $screenshotPath,
                'source'          => $item['source'] ?? null,
                'created_at'      => now(),
                'updated_at'      => now(),
            ];
        })->toArray();

        PlayLog::upsert(
            $logs,
            ['device_id', 'played_at', 'input_number'],
            ['input_name', 'input_type', 'duration_ms', 'position_ms', 'screenshot_path', 'source', 'updated_at']
        );

        return response()->json([
            'status'     => 'success',
            'message'    => count($logs) . ' logs processed for ' . $machineName,
            'screenshots' => count($screenshotMap) . ' screenshots stored',
        ]);
    }
}