<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class PasswordField extends Field
{
    protected bool $fillFromSource = false;

    public function type(): string
    {
        return 'password';
    }
}
