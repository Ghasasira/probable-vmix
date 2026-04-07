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

    protected $appends = ['duration_formatted'];

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
