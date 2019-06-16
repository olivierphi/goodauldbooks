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

// Not a huge fan of Facades, so let's resolve the Route one to a Laravel router in a IIFE :-)
(function (\Illuminate\Routing\Router $router) {
    $router->namespace('API\Library')->prefix('library')->group(function () use ($router) {
        $router->resource('books', 'BookController')->only([
            'index', 'show',
        ]);
    });
})(\Route::getFacadeRoot());
