<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';

Route::middleware(['web'])->group(function () {
    Route::get('/sanctum/csrf-cookie', function () {
        return response()->noContent();
    });
});