<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class ComposerField extends Field
{
    public function type(): string
    {
        return 'composer';
    }

    public function rows(int $rows): static
    {
        return $this->attribute('rows', $rows);
    }
}
