<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class HiddenField extends Field
{
    public function type(): string
    {
        return 'hidden';
    }
}
