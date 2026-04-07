<?php

use App\Http\Controllers\Api\IngestController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;

Route::post('/newdata', [IngestController::class, 'store']);
Route::post('/upload-screenshot', [UploadController::class, 'store']);
