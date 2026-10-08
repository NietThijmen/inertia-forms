<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class CheckboxField extends Field
{
    public function type(): string
    {
        return 'checkbox';
    }

    /**
     * Submitted value when the checkbox is checked. Defaults to "1".
     */
    public function checkedValue(string|int|float $value): static
    {
        return $this->attribute('value', $value);
    }
}
