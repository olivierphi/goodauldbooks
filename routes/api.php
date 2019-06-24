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

use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;

// Not a huge fan of Facades, so let's resolve the Route one to a Laravel router in a IIFE :-)
(function (Router $router) {
    $router->namespace('API\Library')->prefix('library')->group(function () use ($router) {
        /*
         * "/api/library" URLs will be managed by Controllers living in the "API\Library" namespace.
         */

        $router->resource('books', 'BookController')->only([
            'index', 'show',
        ]);

        $router->get('/autocompletion', 'SearchController@quickAutocompletion');
    });
})(Route::getFacadeRoot());
