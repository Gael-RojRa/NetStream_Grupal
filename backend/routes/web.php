<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TVDBController;

Route::get('/tvdb/token', [TVDBController::class, 'getToken']);
Route::get('/tvdb/movies', [TVDBController::class, 'getMovies']);
Route::get('/tvdb/image', [TVDBController::class, 'getImage']);
