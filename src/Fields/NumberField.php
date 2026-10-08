<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class NumberField extends Field
{
    public function type(): string
    {
        return 'number';
    }

    public function min(int|float|string $min): static
    {
        return $this->attribute('min', $min);
    }

    public function max(int|float|string $max): static
    {
        return $this->attribute('max', $max);
    }

    public function step(int|float|string $step): static
    {
        return $this->attribute('step', $step);
    }
}
