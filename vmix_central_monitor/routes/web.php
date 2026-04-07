<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\PlayLogController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('devices', [DeviceController::class, 'index'])->name('devices.index');
    Route::get('devices/{device}', [DeviceController::class, 'show'])->name('devices.show');
    Route::put('devices/{device}', [DeviceController::class, 'update'])->name('devices.update');
    Route::get('logs', [PlayLogController::class, 'index'])->name('logs.index');
});

require __DIR__.'/settings.php';
