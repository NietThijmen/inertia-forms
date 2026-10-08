<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class DateField extends Field
{
    public function type(): string
    {
        return 'date';
    }
}
