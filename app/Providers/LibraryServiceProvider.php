<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * N.B. No need to defer these services, as they are used in pretty much all our routes.
 */
class LibraryServiceProvider extends ServiceProvider
{
    public $singletons = [
        // Repositories
        \App\Library\LibraryRepositoryInterface::class => \App\Library\LibraryRepository::class,
        \App\Library\BookRepositoryInterface::class => \App\Library\BookRepository::class,
    ];

    /**
     * Register services.
     */
    public function register()
    {
    }

    /**
     * Bootstrap services.
     */
    public function boot()
    {
    }
}
