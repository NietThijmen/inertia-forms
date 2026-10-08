<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class TimeField extends Field
{
    public function type(): string
    {
        return 'time';
    }
}
