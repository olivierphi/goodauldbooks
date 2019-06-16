<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Not a huge fan of Facades, so let's resolve the Route one to a Laravel router in a IIFE :-)
(function (\Illuminate\Routing\Router $router) {
    $router->namespace('Web')->group(function () use ($router) {
        $router->get('/', 'HomeController@index')->name('home');
        $router->get('/library/books/{book}', 'LibraryController@book')->name('book');
        // Unimplemented controller actions:
        $router->get('/library/authors/{author}', 'LibraryController@booksByAuthor')->name('books.by_author');
        $router->get('/library/genres/{genre}', 'LibraryController@booksByGenre')->name('books.by_genre');
    });
})(\Route::getFacadeRoot());
