<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class SelectField extends Field
{
    use HasOptions;

    protected bool $multiple = false;

    public function type(): string
    {
        return 'select';
    }

    public function multiple(bool $multiple = true): static
    {
        $this->multiple = $multiple;

        return $this;
    }

    public function isMultiple(): bool
    {
        return $this->multiple;
    }
}
