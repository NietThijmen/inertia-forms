<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class ToggleField extends Field
{
    public function type(): string
    {
        return 'toggle';
    }

    /**
     * Submitted value when the switch is on. Defaults to "1".
     */
    public function checkedValue(string|int|float $value): static
    {
        return $this->attribute('value', $value);
    }
}
