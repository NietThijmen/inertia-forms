<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class ComboboxField extends Field
{
    use HasOptions;

    public function type(): string
    {
        return 'combobox';
    }
}
