<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class TextareaField extends Field
{
    public function type(): string
    {
        return 'textarea';
    }

    public function rows(int $rows): static
    {
        return $this->attribute('rows', $rows);
    }
}
