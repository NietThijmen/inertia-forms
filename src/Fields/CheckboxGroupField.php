<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class CheckboxGroupField extends Field
{
    use HasOptions;

    public function type(): string
    {
        return 'checkbox-group';
    }

    public function htmlName(): string
    {
        $name = parent::htmlName();

        return str_ends_with($name, '[]') ? $name : $name.'[]';
    }

    public function isMultiple(): bool
    {
        return true;
    }
}
