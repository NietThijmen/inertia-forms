<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Tests;

use NietThijmen\InertiaForms\InertiaFormsServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;

abstract class TestCase extends Orchestra
{
    /**
     * @return list<class-string>
     */
    protected function getPackageProviders($app): array
    {
        return [
            InertiaFormsServiceProvider::class,
        ];
    }
}
