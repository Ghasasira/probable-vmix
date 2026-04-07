<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Device;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'machine_name' => 'required|string',
            'screenshot' => 'required|image|max:2048', // Max 2MB
        ]);

        $machineName = $request->machine_name;
        $file = $request->file('screenshot');
        $filename = $file->getClientOriginalName();

        // Store using original name to match the path synced in the JSON payload
        $path = $file->storeAs("screenshots/{$machineName}", $filename, 'public');

        return response()->json([
            'status' => 'success',
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
        ]);
    }
}
