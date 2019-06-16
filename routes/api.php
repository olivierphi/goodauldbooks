<?php

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::namespace('API\Library')->prefix('library')->group(function () {
    Route::resource('books', 'BookController')->only([
        'index', 'show',
    ]);
});
