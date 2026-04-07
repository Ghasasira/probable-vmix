<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Device extends Model
{
    protected $fillable = [
        'machine_name',
        'display_name',
        'last_seen_at',
        'last_input_name',
        'is_active',
    ];

    protected $casts = [
        'last_seen_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected $appends = ['is_online'];

    public function getIsOnlineAttribute(): bool
    {
        if (!$this->last_seen_at) {
            return false;
        }

        return $this->last_seen_at->gt(now()->subMinutes(10));
    }

    public function logs()
    {
        return $this->hasMany(PlayLog::class);
    }
}
