<?php

use App\Http\Controllers\SignInController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SignInController::class, 'create'])->name('sign-in');
Route::post('/sign-in', [SignInController::class, 'store'])->name('sign-in.store');
