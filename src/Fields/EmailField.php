<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class EmailField extends Field
{
    public function type(): string
    {
        return 'email';
    }
}
