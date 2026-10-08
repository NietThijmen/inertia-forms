<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms;

use Illuminate\Support\ServiceProvider;

final class InertiaFormsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__.'/../config/inertia-forms.php',
            'inertia-forms',
        );
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../config/inertia-forms.php' => config_path('inertia-forms.php'),
        ], 'inertia-forms-config');
    }
}
