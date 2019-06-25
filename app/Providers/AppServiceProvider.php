<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register()
    {
        $this->registerTelescopeInLocalMode();

        $this->app->register(LibraryServiceProvider::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
    }

    private function registerTelescopeInLocalMode()
    {
        if (!$this->app->isLocal()) {
            return;
        }

        // First some session-related stuff Telescope depends on:
        // (we disabled all cookie/session related stuff on this app)
        $this->app['config']['session.driver'] = 'native';
        $this->app->register(\Illuminate\Auth\AuthServiceProvider::class);
        $this->app->register(\Illuminate\Session\SessionServiceProvider::class);

        // Ok, here comes Telescope!
        $this->app->register(TelescopeServiceProvider::class);
    }
}
