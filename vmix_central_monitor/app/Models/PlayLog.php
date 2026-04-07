<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlayLog extends Model
{
    protected $fillable = [
        'device_id',
        'input_number',
        'input_name',
        'input_type',
        'played_at',
        'duration_ms',
        'position_ms',
        'screenshot_path',
        'source',
    ];

    protected $casts = [
        'played_at' => 'datetime',
        'duration_ms' => 'integer',
        'position_ms' => 'integer',
    ];

    protected $appends = ['duration_formatted', 'screenshot_url'];

    public function getScreenshotUrlAttribute(): ?string
    {
        if (!$this->screenshot_path) {
            return null;
        }

        // The path in DB is just the filename or relative agent path (e.g., screenshots/img.jpg)
        // We expect it to be stored on the server under screenshots/{machine_name}/{filename}
        $filename = basename($this->screenshot_path);
        
        // This assumes the file actually exists on the server's public disk
        return \Illuminate\Support\Facades\Storage::disk('public')->url("screenshots/{$this->device->machine_name}/{$filename}");
    }

    public function getDurationFormattedAttribute(): string
    {
        $duration = $this->duration_ms / 1000;
        $hours = floor($duration / 3600);
        $minutes = floor(($duration / 60) % 60);
        $seconds = $duration % 60;
        $ms = $this->duration_ms % 1000;

        return sprintf('%02d:%02d:%02d.%03d', $hours, $minutes, $seconds, $ms);
    }

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
