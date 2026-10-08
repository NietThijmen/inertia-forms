<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class ColorField extends Field
{
    public function type(): string
    {
        return 'color';
    }
}
