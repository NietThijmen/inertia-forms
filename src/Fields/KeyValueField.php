<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class KeyValueField extends Field
{
    public function type(): string
    {
        return 'key-value';
    }
}
