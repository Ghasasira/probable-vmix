<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeviceController extends Controller
{
    public function index()
    {
        return Inertia::render('devices/index', [
            'devices' => Device::withCount('logs')
                ->orderByDesc('last_seen_at')
                ->get(),
        ]);
    }

    public function show(Device $device)
    {
        return Inertia::render('devices/show', [
            'device' => $device,
            'logs' => $device->logs()
                ->orderByDesc('played_at')
                ->paginate(50)
                ->withQueryString(),
            'stats' => [
                'total_logs' => $device->logs()->count(),
                'unique_inputs' => $device->logs()->distinct('input_name')->count(),
            ],
        ]);
    }

    public function update(Request $request, Device $device)
    {
        $validated = $request->validate([
            'display_name' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $device->update($validated);

        return back()->with('message', 'Device updated successfully.');
    }
}
