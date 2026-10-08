<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class SubmitField extends Field
{
    public function type(): string
    {
        return 'submit';
    }

    /**
     * @return array<string, mixed>
     */
    public function toInertia(): array
    {
        if ($this->label === null) {
            $this->label = 'Submit';
        }

        return parent::toInertia();
    }
}
