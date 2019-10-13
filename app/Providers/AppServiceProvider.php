<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

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

        // THe following "if" block is a bit dirty for sure, but:
        // 1) Telescope UI needs a session provider to be present, otherwise its usage of the "csrf_token" throws a severe exception
        // 2) Clockwork triggers an error if the session service is present but no Guards are defined (which is our case, as this website has no auth whatsoever)
        // --> so we initialise the "auth" machinery only when we're using the Telescope UI :-)
        $telescopePath = \config('telescope.path');
        if (Str::startsWith(\Request::getRequestUri(), "/${telescopePath}/")) {
            // First some session-related stuff Telescope depends on:
            // (we disabled all cookie/session related stuff on this app)
            $this->app['config']['session.driver'] = 'native';
            $this->app->register(\Illuminate\Auth\AuthServiceProvider::class);
            $this->app->register(\Illuminate\Session\SessionServiceProvider::class);
        }

        // Ok, here comes Telescope!
        $this->app->register(TelescopeServiceProvider::class);
    }
}
